var ctx;
var basevalH;
var chart;
var base = 'EUR';
var rates;
var curnames;
var maxY = 0;

function parseData(data) {
  base = data.base;
  
  rates = data.rates;
  rates[base] = 1.0;
  
  curnames = Object.keys(rates);
  curnames.sort();
}

function getCurVals() {
  maxY = 0;
  vals = [];
  
  curnames.forEach(function(cur) {
    var c = 1 / rates[cur];
    c = Math.round(c * 10000) / 10000;
    
    vals.push(c);
    
    if (c > maxY) {
      maxY = c;
    }
  });
  
  return vals;
}

function getData(callback) {
  $.ajax({
      type: "POST",
      url: `http://api.fixer.io/latest?base=${base}`,
      async:true,
      dataType : 'jsonp',
      crossDomain:true,
      success: function(data, status, xhr) {
        parseData(data);
        callback();
      }
  });
}

function barClick(e, array) {
  if (array[0]) {
    base = array[0]._view.label;
    getData(updateDataset);
  }
}

function updateDataset() {
  chart.data.datasets[0].data = getCurVals();
  chart.options.scales.yAxes[0].ticks.max = maxY;
  chart.update();
  showBaseVal();
}

function showBaseVal() {
  basevalH.text(`Base currency: ${base}`);
}

function prepareChart() {
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: curnames,
      datasets: [{
        label: 'Currency Data',
        backgroundColor: 'rgb(200, 200, 0)',
        borderColor: 'rgb(200, 200, 0)',
        data: getCurVals(),
      }],
    },
    options: {
      legend: {
        display: false,
      },
      onClick: barClick,
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: maxY,
          },
        }],
      },
    },
  });
  
  showBaseVal();
}

window.onload = function() {
  ctx = document.getElementById('chartcanvas').getContext('2d');
  basevalH = $('#basevalue');
  
  getData(prepareChart);
}
