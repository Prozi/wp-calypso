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
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import DatePicker from 'my-sites/stats/stats-date-picker';
import Module from './store-stats-module';
import List from './store-stats-list';
import { topProducts } from 'woocommerce/app/store-stats/constants';

const titles = {
	products: topProducts.title,
	categories: translate( 'Categories' ),
	coupons: translate( 'Coupons' ),
};

class StoreStatsListView extends Component {
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
		const { siteId, slug, startDate, type, unit } = this.props;
		const today = moment().format( 'YYYY-MM-DD' );
		const selectedDate = startDate || today;
		const listviewQuery = {
			unit,
			date: selectedDate,
			quantity: '30',
			limit: '100'
		};
		return (
			<Main className="store-stats__list-view woocommerce" wideLayout={ true }>
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
				<Module
					siteId={ siteId }
					emptyMessage={ topProducts.empty }
					query={ listviewQuery }
					statType="statsTopSellers"
				>
					<List
						siteId={ siteId }
						values={ topProducts.values }
						query={ listviewQuery }
						statType="statsTopSellers"
					/>
				</Module>
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
)( StoreStatsListView );
