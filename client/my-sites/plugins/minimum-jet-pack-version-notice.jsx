/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import notices from 'notices';
import { getSelectedSiteId } from 'state/ui/selectors';

import {
	getSite,
	isJetpackSite,
	siteHasMinimumJetpackVersion
} from 'state/sites/selectors';

class MinimumJetpackVersionNotice extends React.Component {

	static propTypes = {
		translate: React.PropTypes.func.isRequired,
		minimumJetpackVersionFailed: React.PropTypes.bool.isRequired,
		site: React.PropTypes.object,
	};

	notificationHandler( { minimumJetpackVersionFailed, site, translate } ) {
		if ( minimumJetpackVersionFailed ) {
			notices.warning(
				translate(
					'Jetpack %(version)s is required to take full advantage of plugin management in %(site)s.',
					{
						args: {
							version: config( 'jetpack_min_version' ),
							site: site.domain
						}
					}
				), {
					button: translate( 'Update now' ),
					href: site.options.admin_url + 'plugins.php?plugin_status=upgrade',
					dismissID: 'allSitesNotOnMinJetpackVersion' + config( 'jetpack_min_version' ) + '-' + site.ID
				}
			);
		}
	}

	componentDidMount() {
		this.notificationHandler( this.props );
	}

	componentDidUpdate( prevProps ) {
		if ( !! this.props.site && ( ! prevProps.site || this.props.site.ID !== prevProps.site.ID ) ) {
			this.notificationHandler( this.props );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			minimumJetpackVersionFailed: !! isJetpackSite( state, selectedSiteId ) &&
				! siteHasMinimumJetpackVersion( state, selectedSiteId ),
			site: getSite( state, selectedSiteId ),
		};
	}
)( localize( MinimumJetpackVersionNotice ) );
