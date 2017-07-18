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

    var data = {"OkPercent": 41.93758127438232, "KoPercent": 58.06241872561768};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.12024940617577197, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)  ", "F (Frustration threshold)", "Label"], "items": [{"data": [0.30779944289693595, 500, 1500, "Submit Idea"], "isController": false}, {"data": [0.7447698744769874, 500, 1500, "Add Comment"], "isController": false}, {"data": [0.9511627906976744, 500, 1500, "Like idea"], "isController": false}, {"data": [0.0, 500, 1500, "Transaction Controller"], "isController": true}, {"data": [0.05725, 500, 1500, "Login"], "isController": false}, {"data": [0.0, 500, 1500, "Navigate to Idea page"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3076, 1786, 58.06241872561768, 38112.998049414855, 0, 270495, 127838.40000000004, 134173.75, 179216.76, 1.3712351770859292, 67.40166346616134, 0.22190828691781012], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Submit Idea", 359, 96, 26.740947075208915, 15584.00557103064, 539, 69556, 60295.0, 60924.0, 64584.0, 0.1628866971024317, 0.2770699102104097, 0.1305739705810291], "isController": false}, {"data": ["Add Comment", 239, 24, 10.0418410041841, 4202.523012552301, 426, 61263, 659.0, 50613.0, 61133.0, 0.10734775146884512, 0.08214996169279767, 0.04327666771918367], "isController": false}, {"data": ["Like idea", 215, 1, 0.46511627906976744, 1411.6930232558138, 202, 43649, 285.8, 1460.7999999999467, 43265.68000000001, 0.09636381238548393, 0.03278059139256018, 0.025102913190099357], "isController": false}, {"data": ["Transaction Controller", 1976, 1762, 89.17004048582996, 58460.59210526326, 0, 270495, 133536.3, 142000.14999999994, 217458.58000000002, 0.8816689600768158, 61.40389856788471, 0.2064590268779638], "isController": true}, {"data": ["Login", 2000, 1641, 82.05, 53620.652999999926, 0, 270495, 133215.7, 139882.89999999994, 192372.96000000002, 0.9174787500453006, 17.588018359724607, 0.0], "isController": false}, {"data": ["Navigate to Idea page", 263, 24, 9.125475285171103, 11755.517110266157, 4385, 65960, 45438.0, 60606.8, 61245.240000000005, 0.11813338471910981, 50.303732094847405, 0.02589475441169799], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: gimloadtest.gailabs.com:80 failed to respond", 52, 2.9115341545352744, 1.6905071521456436], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: gimloadtest.gailabs.com", 662, 37.066069428891375, 21.52145643693108], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 1, 0.055991041433370664, 0.032509752925877766], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Unexpected end of file from server", 379, 21.22060470324748, 12.321196358907672], "isController": false}, {"data": ["Non HTTP response code: java.net.ConnectException/Non HTTP response message: Connection timed out: connect", 256, 14.33370660694289, 8.322496749024708], "isController": false}, {"data": ["500/Service unavailable (with message)", 29, 1.6237402015677491, 0.9427828348504551], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 407, 22.788353863381857, 13.23146944083225], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3076, 1786, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: gimloadtest.gailabs.com", 662, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 407, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unexpected end of file from server", 379, "Non HTTP response code: java.net.ConnectException/Non HTTP response message: Connection timed out: connect", 256, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: gimloadtest.gailabs.com:80 failed to respond", 52], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Submit Idea", 359, 96, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 43, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: gimloadtest.gailabs.com:80 failed to respond", 34, "500/Service unavailable (with message)", 18, "Non HTTP response code: java.net.ConnectException/Non HTTP response message: Connection timed out: connect", 1, null, null], "isController": false}, {"data": ["Add Comment", 239, 24, "500/Service unavailable (with message)", 11, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 8, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: gimloadtest.gailabs.com:80 failed to respond", 5, null, null, null, null], "isController": false}, {"data": ["Like idea", 215, 1, "Non HTTP response code: java.net.ConnectException/Non HTTP response message: Connection timed out: connect", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Login", 2000, 1641, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: gimloadtest.gailabs.com", 662, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unexpected end of file from server", 379, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 347, "Non HTTP response code: java.net.ConnectException/Non HTTP response message: Connection timed out: connect", 252, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 1], "isController": false}, {"data": ["Navigate to Idea page", 263, 24, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: gimloadtest.gailabs.com:80 failed to respond", 13, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 9, "Non HTTP response code: java.net.ConnectException/Non HTTP response message: Connection timed out: connect", 2, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
