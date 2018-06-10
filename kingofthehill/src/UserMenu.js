import React, { Component } from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';

class UserMenu extends Component
{
    constructor(props)
    {
        super(props);
    }

    render()
    {
        return(
            <Navbar inverse collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <img style={{height : 60}} src={this.props.photoURL} />
                    </Navbar.Brand>
                    <Navbar.Brand>
                        <a href="#Usuario">{this.props.nickname}</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem eventKey={1} href="#">
                            Link
                        </NavItem>
                        <NavItem eventKey={2} href="#">
                            Link
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}
export default UserMenu;