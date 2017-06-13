/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { moment, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import StoreStatsList from './store-stats-list';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import DatePicker from 'my-sites/stats/stats-date-picker';

const titles = {
	products: translate( 'Products' ),
	categories: translate( 'Categories' ),
	coupons: translate( 'Coupons' ),
};

class StoreStats extends Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		startDate: PropTypes.string,
		unit: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
	};

	goBack = () => {
		if ( typeof window !== 'undefined' && window.history.length ) {
			window.history.back();
		} else {
			const pathParts = this.props.path.split( '/' );
			const queryString = this.props.context.querystring ? '?' + this.props.context.querystring : '';
			const pathExtra = `${ pathParts[ pathParts.length - 2 ] }/${ pathParts[ pathParts.length - 1 ] }${ queryString }`;
			const defaultBack = `/store/stats/orders/${ pathExtra }`;

			setTimeout( () => {
				page.show( defaultBack );
			} );
		}
	};

	render() {
		const { path, siteId, slug, startDate, type, unit } = this.props;
		const today = moment().format( 'YYYY-MM-DD' );
		const selectedDate = startDate || today;
		const listviewQuery = {
			unit,
			date: selectedDate,
			quantity: '30',
			limit: '100'
		};

		return (
			<Main className="store-stats woocommerce" wideLayout={ true }>
				<HeaderCake onClick={ this.goBack }>{ titles[ type ] }</HeaderCake>
				<StatsPeriodNavigation
					date={ selectedDate }
					period={ unit }
					url={ `/store/stats/${ type }/${ unit }/${ slug }` }
				>
					<DatePicker
						period={ unit }
						date={ selectedDate }
						query={ listviewQuery }
						statsType="statsTopSellers"
						showQueryDate
					/>
				</StatsPeriodNavigation>
				<StoreStatsList
					path={ path }
					query={ listviewQuery }
					selectedDate={ selectedDate }
					siteId={ siteId }
					unit={ unit }
				/>
			</Main>
		);
	}
}

export default connect(
	state => {
		return {
			slug: getSelectedSiteSlug( state ),
			siteId: getSelectedSiteId( state ),
		};
	}
)( StoreStats );
