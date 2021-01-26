import React, { Component } from 'react';
import styles from "./GoogleForm.module.css";

class GoogleForm extends Component {
    render() {
        return (
            <div className={styles.form}>
                <h1 className={styles.header}>{this.props.header}</h1>
                <p className={styles.blurb}>{this.props.blurb}</p>
                <iframe src={this.props.url} width={this.props.width} height={this.props.height} frameborder="0" marginwidth="0">Loading...</iframe>
                {/* <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdqd_mLfxBMJ6-rtzNddxhrL4W0Hoa5_ZDaREMyFwmo8C9lKg/viewform?embedded=true" width="500" height="767" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe> */}
            </div>
        );
    }
}

export default GoogleForm;