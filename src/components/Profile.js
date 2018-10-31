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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Update from '@material-ui/icons/Update';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core';
import { User, UserCars, Security, AddCarDialog, AppMessage } from '.';
import { updateUser } from '../relay/mutations';
import { AuthStorage, Storage, clone } from '../common';

const styles = theme => ({
    root: {
        width: '100%',
    },
    right: {
        justifyContent: 'flex-start',
    },
    grey: {
        background: '#f5f5f5',
    },
    summary: {},
    carActions: {
        justifyContent: 'flex-start',
        paddingLeft: '1.5em',
    },
    heading: {
        fontSize: theme.typography.pxToRem(16),
    },
    icon: {
        verticalAlign: 'bottom',
        height: 20,
        width: 20,
    },
    details: {
        alignItems: 'center',
        marginTop: '.5em',
    },
    column: {
        flexBasis: '33.33%',
    },
    helper: {
        borderLeft: `2px solid ${theme.palette.divider}`,
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline',
        },
    },
});

export class Profile extends Component {
    state = {
        addCarOpen: false,
        expanded: null,
        userErrors: [],
        passwordErrors: [],
        userBtnDisabled: true,
        passwordBtnDisabled: true,
        user: {
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        },
        type: '',
    }

    addCar = () => {
        this.setState({ addCarOpen: true });
    }

    updateUser = () => {
        if (!this.state.type) {
            return ;
        }

        const userData = clone(this.state.user);

        if (this.state.type !== 'password') {
            delete userData.password;
        }

        updateUser(userData, () => {
            this.setState({ type: '' }, () => {
                AuthStorage.update(userData);
            });
        }, errors => {
            const errKey = `${this.state.type}Errors`;
            this.setState({ [errKey]: errors });
        }, this.state.type === 'password');
    }

    dataChange = (type, data, errors) => {
        const id = this.props.data.user.__id;

        if (!id) {
            throw new Error('user identifier expected, but was not provided!');
        }

        if (type === 'user' || type === 'password') {
            const errKey = `${type}Errors`;
            const btnStateKey = `${type}BtnDisabled`;
            this.setState({
                type,
                user: Object.assign(data, { id, }),
                [errKey]: errors,
                [btnStateKey]: this.disabled(type, data),
            });
        }
    }

    disabled = (type, data) => {
        if (type === 'password') {
            return !(data.oldPassword && data.password);
        }

        else if (type === 'user') {
            return !(
                data.firstName.trim() &&
                data.lastName.trim() &&
                data.email.trim()
            );
        }

        return false;
    }

    key = () => `profile-panel`

    open = panel => (event, expanded) => {
        this.setState({ expanded: expanded ? panel : 0 }, () => {
            Storage.set(this.key(), panel);
        });
    }

    actionProps = (type) => {
        return {
            onClick: this.updateUser,
            disabled: this.state[`${type}BtnDisabled`],
        };
    }

    actionBtn = (Icon, text, props) => {
        return <Button {...props}><Icon />&nbsp;{text}</Button>;
    }

    expanded = () => {
        let { expanded } = this.state;

        if (expanded === null) {
            expanded = Storage.get(this.key());

            if (expanded === null || expanded === undefined) {
                expanded = 0;
                Storage.set(this.key(), expanded);
            }
        }

        return expanded;
    }

    render() {
        const { classes, data } = this.props;
        const expanded = this.expanded();

        if (!data.user) {
            AuthStorage.clear();

            return <AppMessage
                variant="error"
                message="Unauthorized!"
                style={{ maxWidth: 'initial' }}
            />;
        }

        const userId = (data.user || {}).__id;
        const panels = {
            'Customer Details': {
                component: User,
                actions: [{
                    component: props => this.actionBtn(SaveAlt, 'Save', props),
                    props: this.actionProps('user'),
                }],
                type: 'user',
            },
            'Security': {
                component: Security,
                actions: [{
                    component: props => this.actionBtn(Update, 'Update', props),
                    props: this.actionProps('password'),
                }],
                type: 'password',
            },
            'Garage': {
                component: UserCars,
                actions: [{ component: AddCarDialog, props: { userId } }],
                type: 'garage',
            },
        };

        return <div>
            {Object.keys(panels).map((name, key) => {
                const Child = panels[name].component;
                const errKey = `${panels[name].type}Errors`;
                const errors = this.state[errKey];

                return <ExpansionPanel
                    key={key}
                    expanded={expanded === key}
                    onChange={this.open(key)}
                >
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMore/>}
                        className={classes.summary}
                    >
                        <Typography className={classes.heading}>
                            {name}
                        </Typography>
                    </ExpansionPanelSummary>
                    <Divider/>
                    <ExpansionPanelDetails className={classes.details}>
                        <Child
                            data={data.user}
                            onChange={this.dataChange}
                            errors={errors}
                        />
                    </ExpansionPanelDetails>
                    {panels[name].actions.length > 0 &&
                    (<div><Divider />
                    <ExpansionPanelActions className={classes.carActions}>
                        {panels[name].actions.map((action, i) => {
                            const Action = action.component;
                            const props = action.props || {};
                            return <Action key={i} {...props}/>
                        })}
                    </ExpansionPanelActions></div>)}
                </ExpansionPanel>
            })}
        </div>;
    }
}

Profile.propTypes = {
    classes: PropTypes.object.isRequired,
};

Profile = withStyles(styles)(Profile);
