/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
const AllSites = require( 'my-sites/all-sites' ),
	analytics = require( 'lib/analytics' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' ),
	Site = require( 'blocks/site' ),
	Gridicon = require( 'gridicons' ),
	UpgradesActions = require( 'lib/upgrades/actions' ),
	DomainsStore = require( 'lib/domains/store' ),
	DomainWarnings = require( 'my-sites/upgrades/components/domain-warnings' );

import config from 'config';
import SiteNotice from './notice';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedOrAllSites } from 'state/selectors';

class CurrentSite extends Component {
	static propTypes = {
		isJetpack: React.PropTypes.bool,
		isPreviewShowing: React.PropTypes.bool,
		siteCount: React.PropTypes.number.isRequired,
		setLayoutFocus: React.PropTypes.func.isRequired,
		selectedSiteId: React.PropTypes.number,
		selectedSite: React.PropTypes.object,
		translate: React.PropTypes.func.isRequired,
		anySiteSelected: React.PropTypes.array
	};

	state = {
		domainsStore: DomainsStore
	};

	componentWillMount() {
		const { selectedSiteId, isJetpack } = this.props;
		if ( selectedSiteId && ! isJetpack ) {
			UpgradesActions.fetchDomains( selectedSiteId );
		}

		DomainsStore.on( 'change', this.handleStoreChange );
	}

	componentWillUnmount() {
		DomainsStore.off( 'change', this.handleStoreChange );
	}

	componentDidUpdate( prevProps ) {
		const { selectedSiteId, isJetpack } = this.props;
		if ( selectedSiteId && ! isJetpack && selectedSiteId !== prevProps.selectedSiteId ) {
			UpgradesActions.fetchDomains( selectedSiteId );
		}
	}

	handleStoreChange = () => {
		this.setState( { domainsStore: DomainsStore } );
	}

	switchSites = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );

		analytics.ga.recordEvent( 'Sidebar', 'Clicked Switch Site' );
	}

	getDomainWarnings() {
		const { selectedSiteId, selectedSite: site } = this.props;

		if ( ! selectedSiteId ) {
			return null;
		}

		const domainStore = this.state.domainsStore.getBySite( selectedSiteId );
		const domains = domainStore && domainStore.list || [];

		return (
			<DomainWarnings
				isCompact
				selectedSite={ site }
				domains={ domains }
				position="site-sidebar"
				ruleWhiteList={ [
					'unverifiedDomainsCanManage',
					'unverifiedDomainsCannotManage',
					'expiredDomainsCanManage',
					'expiringDomainsCanManage',
					'expiredDomainsCannotManage',
					'expiringDomainsCannotManage',
					'wrongNSMappedDomains',
					'pendingGappsTosAcceptanceDomains'
				] }
			/>
		);
	}

	previewSite = ( event ) => this.props.onClick && this.props.onClick( event );

	renderSiteViewLink() {
		if ( config.isEnabled( 'standalone-site-preview' ) ) {
			return;
		}

		const {
			isPreviewShowing,
			selectedSite,
			translate,
		} = this.props;

		const viewText = selectedSite.is_previewable
			? translate( 'Site Preview' )
			: translate( 'View site' );

		const viewIcon = selectedSite.is_previewable
			? 'computer'
			: 'external';

		return (
			<a
				href={ selectedSite.URL }
				onClick={ this.previewSite }
				className={ classNames( 'current-site__view-site', {
					selected: isPreviewShowing,
				} ) }
				target="_blank"
				rel="noopener noreferrer"
			>
				<span className="current-site__view-site-text">
					{ viewText }
				</span>
				<Gridicon icon={ viewIcon } />
			</a>
		);
	}

	render() {
		const { isJetpack, selectedSite, translate, anySiteSelected } = this.props;

		if ( ! anySiteSelected.length ) {
			return (
				<Card className="current-site is-loading">
					{ this.props.siteCount > 1 &&
						<span className="current-site__switch-sites">&nbsp;</span>
					}
					<div className="site">
						<a className="site__content">
							<div className="site-icon" />
							<div className="site__info">
								<span className="site__title">{ translate( 'Loading My Sites…' ) }</span>
							</div>
						</a>
					</div>
				</Card>
			);
		}

		return (
			<Card className="current-site">
				{ this.props.siteCount > 1 &&
					<span className="current-site__switch-sites">
						<Button compact borderless onClick={ this.switchSites }>
							<Gridicon icon="arrow-left" size={ 18 } />
							{ translate( 'Switch Site' ) }
						</Button>
					</span>
				}
				{ selectedSite
					? <div>
						<Site site={ selectedSite } />
						{ this.renderSiteViewLink() }
					</div>
					: <AllSites />
				}
				{ ! isJetpack && this.getDomainWarnings() }
				<SiteNotice site={ selectedSite } allSitesPath={ this.props.allSitesPath } />
			</Card>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const user = getCurrentUser( state );

		return {
			isJetpack: isJetpackSite( state, selectedSiteId ),
			selectedSiteId,
			selectedSite: getSelectedSite( state ),
			anySiteSelected: getSelectedOrAllSites( state ),
			siteCount: get( user, 'visible_site_count', 0 ),
		};
	},
	{ setLayoutFocus },
)( localize( CurrentSite ) );
