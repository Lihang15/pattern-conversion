// import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { DefaultFooter } from '@ant-design/pro-layout';
// import * as constants from '@/services/api/constants';
import { Button, Drawer } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import styles from './styles.less';


type FooterProps = {
  removeLink?: boolean;
};

const Footer: FC<FooterProps> = ({ removeLink }) => {
//   const intl = useIntl();
//   const { initialState } = useModel('@@initialState');
//   const { configs } = initialState || {};

//   const defaultMessage = intl.formatMessage({
//     id: 'app.copyright.produced',
//     defaultMessage: 'goutou and naikou.',
//   });

  const currentYear = new Date().getFullYear();

  const hasAccepted = !!sessionStorage.getItem('accept-rules') || false;
  const [visible, setVisible] = useState(!hasAccepted);

  const onClose = () => {
    sessionStorage.setItem('accept-rules', 'true');
    setVisible(false);
  };

//   const version = `Version: ${configs?.version}`;
  const version = `Version:`;

  return (
    <div className="mn-footer">
      {/* <p className={styles.contact}>
        Contact support at <a href="mailto:support@marketnode.com">support@marketnode.com</a>
      </p>
      <p className={styles.contact}>
        Support Hours: 9:00am - 6:00pm Singapore Time, Monday - Friday excluding SG public holidays.
      </p> */}
      <DefaultFooter style={{backgroundColor: 'transparent'}}
        // links={
        //   !removeLink
        //     ? [
        //         {
        //           key: 'terms',
        //           title: <FormattedMessage id="pages.register.agree.terms" />,
        //           href: 'constants.register.TermsOfService',
        //           blankTarget: true,
        //         },
        //         {
        //           key: 'privacy',
        //           title: <FormattedMessage id="pages.register.agree.privacy" />,
        //           href: 'constants.register.PrivacyPolicy',
        //           blankTarget: true,
        //         },
        //         {
        //           key: 'rulebook',
        //           title: <FormattedMessage id="app.footer.platform.rulebook" />,
        //           href: 'constants.register.PlatformRules',
        //           blankTarget: true,
        //         },
        //       ]
        //     : []
        // }
        // copyright={`${currentYear} ${defaultMessage} ${version}`}
        copyright={`Copyright © 2025 Beijing Huafeng Test & Control Technology Co. All rights reserved. version: 1.0`}
      />
      {/* <Feedback /> */}

      <Drawer placement="bottom" height={100} closable={false} mask={false} open={visible}>
        <div className={styles.reminder}>
          <p>
            <b>Reminder:&nbsp;</b>
            By using our services, you agree to our{' '}
            <a href={'constants.register.PlatformRules'} target="_blank">
              Platform Rules
            </a>{' '}
            and{' '}
            <a href={'constants.register.TermsOfService'} target="_blank">
              Terms of Service
            </a>
            . Click 'Ok' to close this banner.
          </p>
          <Button type="primary" onClick={onClose}>
            OK
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default Footer;
