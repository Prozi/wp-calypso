/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import QuerySiteStats from 'components/data/query-site-stats';
import { getSiteStatsNormalizedData, isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class StoreStatsList extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		path: PropTypes.string.isRequired,
		query: PropTypes.object.isRequired,
		selectedDate: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	render() {
		const { siteId, query, data, unit } = this.props;

		const titles = (
			<TableRow isHeader>
				{ [ 'Product', 'Qty', 'Total' ].map( ( item, i ) => (
					<TableItem isHeader key={ i } isTitle={ 0 === i }>{ item }</TableItem>
				) ) }
			</TableRow>
		);

		const tableData = data.map( row => (
			[ row.name, row.sold, row.price ]
		) );

		return (
			<div>
				{ siteId &&
					<QuerySiteStats
						query={ query }
						siteId={ siteId }
						statType="statsTopSellers"
					/>
				}
				<Table header={ titles } compact={ true }>
					{ tableData.map( ( row, i ) => (
						<TableRow key={ i }>
							{ row.map( ( item, j ) => (
								<TableItem key={ j } isTitle={ 0 == j }>{ item }</TableItem>
							) ) }
						</TableRow>
					) ) }
				</Table>
			</div>
		);
	}
}

export default connect(
	( state, { query, siteId } ) => {
		return {
			data: getSiteStatsNormalizedData( state, siteId, 'statsTopSellers', query ),
			isRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsTopSellers', query ),
		};
	}
)( StoreStatsList );
