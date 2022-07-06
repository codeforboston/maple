import React, { Component } from 'react';
import styles from "./Footer.module.css";
import { Col, Container, Row } from "../bootstrap";
import { NavLink } from 'react-bootstrap';

export type PageFooterProps ={
    children: any;
}

const PageFooter = ({children}:PageFooterProps)=>{

    return(
        <Container fluid style={{background: '#000'}}>
            <text>This is the footer</text>
            <Row>
                <Col>
                <NavLink href='#'>Testimonies</NavLink>
                <NavLink href='#'>Policies</NavLink>
                <NavLink href='#'>Profile</NavLink>
                <NavLink href='#'>Sign Out</NavLink>
                </Col>
            </Row>
            {children}
        </Container>
    )
}

export default PageFooter;