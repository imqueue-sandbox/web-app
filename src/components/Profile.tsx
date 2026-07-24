/*!
 * ISC License
 *
 * Copyright (c) 2018, Imqueue Sandbox
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ElementType, ReactNode, SyntheticEvent } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SaveAlt from '@mui/icons-material/SaveAlt';
import Update from '@mui/icons-material/Update';
import { User, UserCars, Security, AddCarDialog, AppMessage } from '.';
import { useUpdateUser } from '../relay/mutations';
import { AppStore, AUTH_KEY, PROFILE_PANEL_KEY } from '../common';
import type { AppError, AuthInfo } from '../types';
import type {
    AppRootQuery$data,
} from '../relay/queries/__generated__/AppRootQuery.graphql';
import type {
    updateUserInput,
} from '../relay/mutations/__generated__/updateUserMutation.graphql';

const PanelHeading = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.pxToRem(16),
}));

const PanelDetails = styled(AccordionDetails)({
    alignItems: 'center',
    marginTop: '.5em',
});

const PanelActions = styled(AccordionActions)({
    justifyContent: 'flex-start',
    paddingLeft: '1.5em',
});

/** Panel kinds whose form is editable and therefore collects errors. */
type EditablePanelType = 'user' | 'password';

/**
 * Position of each panel among its siblings. The open one is persisted in
 * `AppStore` under this index, exactly as the class version stored the index of
 * the accordion it built out of a record of panels.
 */
const PANEL = {
    customerDetails: 0,
    security: 1,
    garage: 2,
} as const;

/** The user data the profile forms edit, before anything has been typed. */
const EMPTY_USER: updateUserInput = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
};

/**
 * Tells whether the action of an editable panel has to stay disabled, which it
 * does until the panel's form holds everything its mutation needs.
 */
function isDisabled(type: EditablePanelType, data: updateUserInput): boolean {
    if (type === 'password') {
        return !(data.oldPassword && data.password);
    }

    return !(
        data.firstName?.trim() &&
        data.lastName?.trim() &&
        data.email?.trim()
    );
}

/**
 * The saved value, but only when both it and the value it replaces are
 * non-empty — the field-by-field copying of the class version applied exactly
 * that condition, so an untouched form never blanks the stored session record.
 */
function keep(
    current: string | null | undefined,
    next: string | null | undefined,
): string | null | undefined {
    return next && current ? next : current;
}

interface PanelProps {
    /** Panel title, rendered into the always visible summary row. */
    title: string;
    /** Position of this panel among its siblings. */
    index: number;
    /** Position of the panel currently open. */
    expanded: number;
    onChange: (index: number, expanded: boolean) => void;
    /** Controls rendered under the panel body; omitted when it has none. */
    actions?: ReactNode;
    children: ReactNode;
}

/** One accordion panel of the profile view. */
function Panel(props: PanelProps) {
    const { title, index, expanded, onChange, actions, children } = props;

    return <Accordion
        expanded={expanded === index}
        onChange={(_event: SyntheticEvent, isExpanded: boolean) =>
            onChange(index, isExpanded)
        }
    >
        <AccordionSummary expandIcon={<ExpandMore/>}>
            <PanelHeading>{title}</PanelHeading>
        </AccordionSummary>
        <Divider/>
        <PanelDetails>{children}</PanelDetails>
        {actions && <div>
            <Divider/>
            <PanelActions>{actions}</PanelActions>
        </div>}
    </Accordion>;
}

interface ActionButtonProps {
    icon: ElementType;
    text: string;
    disabled: boolean;
    onClick: () => void;
}

/** The save/update control of an editable panel. */
function ActionButton(props: ActionButtonProps) {
    const { icon: Icon, text, disabled, onClick } = props;

    return <Button disabled={disabled} onClick={onClick}>
        <Icon/>&nbsp;{text}
    </Button>;
}

/**
 * User profile view: the customer details, the password change form and the
 * garage, each in its own accordion panel, with the last opened panel
 * remembered in the local store.
 *
 * The root data is passed in by the route rather than queried here, so this
 * view reads the very same records the rest of the app does. The `id` of the
 * edited user is selected next to the fragment spreads by `AppRootQuery`,
 * because everything else the panels display is masked behind a fragment and
 * the `updateUser` mutation needs a real identifier to address.
 */
export interface ProfileProps {
    data: AppRootQuery$data;
}

export function Profile({ data }: ProfileProps) {
    const [expanded, setExpanded] = useState(
        () => AppStore.get<number>(PROFILE_PANEL_KEY) ?? PANEL.customerDetails,
    );
    const [type, setType] = useState<'' | EditablePanelType>('');
    const [user, setUser] = useState<updateUserInput>(EMPTY_USER);
    const [userErrors, setUserErrors] = useState<AppError[] | undefined>([]);
    const [passwordErrors, setPasswordErrors] =
        useState<AppError[] | undefined>([]);
    const [userBtnDisabled, setUserBtnDisabled] = useState(true);
    const [passwordBtnDisabled, setPasswordBtnDisabled] = useState(true);
    const [updateUser] = useUpdateUser();
    const userId = data.user?.id;

    // The class version wrote the default panel index into the store the first
    // time it rendered without one, so that a reload re-opens the same panel.
    useEffect(() => {
        if (AppStore.get<number>(PROFILE_PANEL_KEY) === null) {
            AppStore.set(PROFILE_PANEL_KEY, PANEL.customerDetails);
        }
    }, []);

    // A root query answering without a user means the stored token no longer
    // buys anything, so the session is dropped and the app falls back to the
    // login form.
    useEffect(() => {
        if (!data.user) {
            AppStore.del(AUTH_KEY);
        }
    }, [data.user]);

    /**
     * Copies the saved fields onto the stored session record, so that the app
     * bar and the drawer show the new name without re-reading the user.
     */
    const updateStore = useCallback((userData: updateUserInput) => {
        const auth = AppStore.get<AuthInfo>(AUTH_KEY);

        if (!auth?.user) {
            return;
        }

        AppStore.set(AUTH_KEY, {
            ...auth,
            user: {
                ...auth.user,
                firstName: keep(auth.user.firstName, userData.firstName),
                lastName: keep(auth.user.lastName, userData.lastName),
                email: keep(auth.user.email, userData.email),
            },
        });
    }, []);

    const save = useCallback(() => {
        if (!type) {
            return;
        }

        // the password only belongs to the payload when the security panel is
        // what is being saved
        const { password, ...withoutPassword } = user;
        const userData = type === 'password' ? user : withoutPassword;

        updateUser(userData, {
            success: () => {
                setType('');
                updateStore(userData);
            },
            failure: errors => {
                if (type === 'user') {
                    setUserErrors(errors);
                } else {
                    setPasswordErrors(errors);
                }
            },
            withoutUser: type === 'password',
        });
    }, [type, user, updateUser, updateStore]);

    const dataChange = useCallback((
        panelType: string,
        panelData: updateUserInput,
        errors?: AppError[],
    ) => {
        if (!userId) {
            throw new Error('user identifier expected, but was not provided!');
        }

        if (panelType !== 'user' && panelType !== 'password') {
            return;
        }

        setType(panelType);
        setUser({ ...panelData, id: userId });

        if (panelType === 'user') {
            setUserErrors(errors);
            setUserBtnDisabled(isDisabled('user', panelData));
        } else {
            setPasswordErrors(errors);
            setPasswordBtnDisabled(isDisabled('password', panelData));
        }
    }, [userId]);

    const panelChange = useCallback((index: number, isExpanded: boolean) => {
        setExpanded(isExpanded ? index : PANEL.customerDetails);
        AppStore.set(PROFILE_PANEL_KEY, index);
    }, []);

    if (!data.user) {
        return <AppMessage
            variant="error"
            message="Unauthorized!"
            style={{ maxWidth: 'initial' }}
        />;
    }

    return <div>
        <Panel
            title="Customer Details"
            index={PANEL.customerDetails}
            expanded={expanded}
            onChange={panelChange}
            actions={<ActionButton
                icon={SaveAlt}
                text="Save"
                disabled={userBtnDisabled}
                onClick={save}
            />}
        >
            <User
                data={data.user}
                onChange={dataChange}
                errors={userErrors}
            />
        </Panel>
        <Panel
            title="Security"
            index={PANEL.security}
            expanded={expanded}
            onChange={panelChange}
            actions={<ActionButton
                icon={Update}
                text="Update"
                disabled={passwordBtnDisabled}
                onClick={save}
            />}
        >
            <Security
                onChange={dataChange}
                errors={passwordErrors}
            />
        </Panel>
        <Panel
            title="Garage"
            index={PANEL.garage}
            expanded={expanded}
            onChange={panelChange}
            actions={<AddCarDialog userId={data.user.id}/>}
        >
            <UserCars data={data.user}/>
        </Panel>
    </div>;
}
