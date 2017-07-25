function main() {

	var token = getParameterByName('token');

	fetch('metadata_collections', null, function(data) {
		$('#result').html(`<pre>${JSON.stringify(data, null, 4)}</pre>`);
	});

	$('#sort-button').click(function() {
		var bridges = [];
		async.series([
			function(callback) {
				fetch('metadata_collections', null, function(data) {
					bridges = data.filter(function(collection) {
						return ( collection.type == "conference_bridge_metadata_collection" );
					});
					console.log(`Got ${bridges.length} bridges`);
					callback(null, data);
				});
			},
			function(callback) {
				var outstanding_requests = 0;
				bridges.forEach(function(bridge) {
					console.log(`Deleting bridge ${bridge.id}: ${bridge.name}`);
					outstanding_requests++;
					var options = {
						success: function(data) {
							outstanding_requests--;
							if (outstanding_requests == 0) {
								callback(null, 'yay');
							}
						}
					};
					PDRequest(token, `metadata_collections/${bridge.id}`, 'DELETE', options);
				});
			},
			function(callback) {
				bridges.sort(function(a, b) {
					console.log(`compare ${a.name} - ${b.name}`);
					return ( b.name.localeCompare(a.name) );
				});
				var addFns = [];
				bridges.forEach(function(bridge) {
					addFns.push(function(callback) {
						console.log(`Adding bridge ${bridge.id}: ${bridge.name}`);
						var options = {
							success: function(data) {
								callback(null, 'yay');
							},
							data: {
								metadata_collection: bridge
							}
						};
						PDRequest(token, `metadata_collections`, 'POST', options);
					});
				});
				async.series(addFns, function(err, results) {
					callback(null, 'yay');
				});
			},
			function(callback) {
				fetch('metadata_collections', null, function(data) {
					$('#result').html(`<h3>All sorted!</h3><pre>${JSON.stringify(data, null, 4)}</pre>`);
				});
			}
		]);
	});
}
$(document).ready(main);
