import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartCanvas, Chart } from 'react-d3-components';
import { scaleTime } from 'd3-scale';

const CandlestickChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      drawChart();
    }
  }, [data]);

  const drawChart = () => {
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Parse the date/time
    const parseDate = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');

    // Format the date/time for x-axis
    const formatDate = d3.timeFormat('%Y-%m-%d %H:%M:%S');

    // Format the values for y-axis
    const formatValue = d3.format('.2f');

    // Scale for x-axis
    const xScale = scaleTime().range([0, width]);

    // Scale for y-axis
    const yScale = d3.scaleLinear().range([height, 0]);

    // Scale for color
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Generate the candlestick shapes
    const candlestick = d3
      .candlestick()
      .x((d) => xScale(parseDate(d.date)))
      .open((d) => yScale(d.open))
      .high((d) => yScale(d.high))
      .low((d) => yScale(d.low))
      .close((d) => yScale(d.close))
      .width(0.5)
      .color((d) => (d.close > d.open ? 'green' : 'red'));

    // Generate the x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(formatDate);

    // Generate the y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(formatValue);

    // Generate the chart
    const chart = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set the domains for x-axis and y-axis
    xScale.domain(d3.extent(data, (d) => parseDate(d.date)));
    yScale.domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)]);

    // Draw the candlesticks
    chart
      .selectAll('.candlestick')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'candlestick')
      .call(candlestick);

    // Draw the x-axis
    chart
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');

    // Draw the y-axis
    chart
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price');

    // Add Bollinger Bands

    // Calculate moving average
    const ma = d3
      .line()
      .x((d) => xScale(parseDate(d.date)))
      .y((d) => yScale(d.ma));

    // Calculate upper band
    const upperBand = d3
      .line()
      .x((d) => xScale(parseDate(d.date)))
      .y((d) => yScale(d.upperBand));

    // Calculate lower band
    const lowerBand = d3
      .line()
      .x((d) => xScale(parseDate(d.date)))
      .y((d) => yScale(d.lowerBand));

    // Draw moving average
    chart.append('path').datum(data).attr('class', 'line ma').attr('d', ma);

    // Draw upper band
    chart
      .append('path')
      .datum(data)
      .attr('class', 'line upperBand')
      .attr('d', upperBand);

    // Draw lower band
    chart
      .append('path')
      .datum(data)
      .attr('class', 'line lowerBand')
      .attr('d', lowerBand);
  };

  return (
    <div>
      <h2>Candlestick Chart with Bollinger Bands</h2>
      <div ref={chartRef}></div>
    </div>
  );
};

export default CandlestickChart;
