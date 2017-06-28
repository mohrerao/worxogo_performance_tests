/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 94.03740374037403, "KoPercent": 5.962596259625963};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.27123774589365707, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)  ", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2558680591459001, 500, 1500, "Submit Idea"], "isController": false}, {"data": [0.4657942035497641, 500, 1500, "Add Comment"], "isController": false}, {"data": [0.956113941639648, 500, 1500, "Like idea"], "isController": false}, {"data": [0.0, 500, 1500, "Transaction Controller"], "isController": true}, {"data": [0.1565808728587415, 500, 1500, "Login"], "isController": false}, {"data": [0.0012982361894529502, 500, 1500, "Navigate to Idea page"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 49995, 2981, 5.962596259625963, 93790.86314631456, 0, 7856975, 92947.50000000006, 204314.40000000002, 6309060.760000004, 1.9955763228012646, 271.5515307541283, 0.7726108864191761], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Submit Idea", 9671, 769, 7.951607899906938, 10652.564574501082, 376, 77139, 51251.00000000004, 55570.6, 58427.12000000004, 0.4778810878077715, 4.066802461618801, 0.490152943335019], "isController": false}, {"data": ["Add Comment", 8902, 266, 2.9880925634688835, 7589.505616715333, 196, 103694, 30562.09999999998, 51143.25, 57856.42999999992, 0.43987592356278743, 0.219719173447593, 0.1886949008555888], "isController": false}, {"data": ["Like idea", 8636, 0, 0.0, 377.83858267716477, 154, 10401, 474.3000000000002, 648.0, 1355.0, 0.4267996367952882, 0.14171081690468557, 0.11211826396282475], "isController": false}, {"data": ["Transaction Controller", 11617, 2981, 25.66066970818628, 403647.4350520785, 0, 7861060, 256024.80000000005, 5382248.500000001, 6449804.019999999, 0.4636992945400196, 271.551953480467, 0.7726120891484346], "isController": true}, {"data": ["Login", 11617, 448, 3.85641731944564, 2694.243350262562, 0, 138849, 4359.0, 5709.200000000001, 14656.339999999931, 0.4636985726969155, 72.43348339622223, 0.0], "isController": false}, {"data": ["Navigate to Idea page", 11169, 1498, 13.412122840003581, 401462.03178440325, 299, 7856975, 192298.0, 5385045.5, 7348178.099999678, 0.44587303369153813, 195.56585343096185, 0.1337120171709821], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: gimloadtest.gailabs.com", 448, 15.028513921502851, 0.8960896089608961], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 191, 6.407245890640724, 0.38203820382038206], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 487, 16.33679973163368, 0.9740974097409741], "isController": false}, {"data": ["403/Forbidden", 8, 0.26836632002683664, 0.016001600160016], "isController": false}, {"data": ["500/Service unavailable (with message)", 1847, 61.95907413619591, 3.6943694369436946], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 49995, 2981, "500/Service unavailable (with message)", 1847, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 487, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: gimloadtest.gailabs.com", 448, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 191, "403/Forbidden", 8], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Submit Idea", 9671, 769, "500/Service unavailable (with message)", 769, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Add Comment", 8902, 266, "500/Service unavailable (with message)", 266, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login", 11617, 448, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: gimloadtest.gailabs.com", 448, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Navigate to Idea page", 11169, 1498, "500/Service unavailable (with message)", 812, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 487, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 191, "403/Forbidden", 8, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
