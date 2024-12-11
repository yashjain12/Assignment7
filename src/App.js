import React, { Component } from "react";
import FileUpload from "./FileUpload";
import * as d3 from "d3";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tweetData: [],
      currTweets: [],
      currCol: "Sentiment"
    }
  }

  handleClick = (tweet) => {
    console.log("mdy", tweet)
    const {currTweets} = this.state;
    const isPresent = currTweets.includes(tweet.RawTweet)
    
    if (isPresent) {
      d3.selectAll("circle").filter(d =>(d.RawTweet === tweet.RawTweet)).attr('stroke-width', 0)
        .attr('stroke', "none")

      this.setState({
        currTweets: currTweets.filter(t => t !== tweet.RawTweet)
      })
    }
    else {
      this.setState({
        currTweets: [tweet.RawTweet, ...currTweets]
      }, () => {
        d3.selectAll("circle")
          .filter((d) => d.RawTweet === tweet.RawTweet)
          .attr("stroke-width", 2)
          .attr("stroke", "black")})
      console.log("not pr")
      console.log(this.state.currTweets)
    }
  }

  handleFileUpload = (uploadedData) => {
    this.setState({ tweetData: uploadedData })
    /*for (let i = 0; i < uploadedData.length; i++) {
      var currTweet = uploadedData[i];
      this.setState({
        idx: currTweet["idx"],
        Month: currTweet["Month"],
        Sentiment: currTweet["Sentiment"],
        Subjectivity: currTweet["Subjectivity"],
        Dimension1: currTweet["Dimension 1"],
        Dimension2: currTweet["Dimension 2"],
        RawTweet: currTweet["RawTweet"]
      });
      console.log('subj', currTweet["Subjectivity"])
    }*/
  }

  createViz = () => {
    const { tweetData, currCol } = this.state;

    const svgWidth = 800;
    const svgHeight = 400;

    const slicedData = tweetData.slice(0, 300);

    //d3.select("#container").selectAll("svg").remove()
    const svg = d3.select("#container").selectAll("svg").data([0]).join("svg").attr("width", svgWidth).attr("height", svgHeight)
    var monthsList = [...new Set(slicedData.map(tweet => tweet.Month))]
    var orderedMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    orderedMonths = orderedMonths.filter(month => monthsList.includes(month))

    const monthsScale = d3.scaleBand().domain(orderedMonths).range([0, svgHeight]).padding(0.1)
    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);

    const getColor = (d) => {
      if (currCol === "Sentiment") {
        return sentimentColorScale(d["Sentiment"])
      }
      else {
        return subjectivityColorScale(d["Subjectivity"])
      }

    }
    orderedMonths.forEach((month) => {
      const tweetM = slicedData.filter((tweet) => tweet.Month === month);

      const xScale = d3.scaleLinear().domain([0, 1]).range([100, svgWidth - 100])
      const yScale = d3.scaleLinear().domain([0, 1]).range([100, monthsScale.bandwidth() - 100])

      tweetM.forEach((tweet, i) => {
        tweet.x = tweet.initialX = xScale(Math.random())
        tweet.y = tweet.initialY = yScale(Math.random()) + monthsScale.bandwidth() / 2 + monthsScale.bandwidth() * orderedMonths.indexOf(tweet.Month)
      });

      console.log(xScale(Math.random()))
      const circles = svg.selectAll(`.circle-${month}`).data(tweetM, (d) => d.idx);

      circles.join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", `circle-${month}`)
            .attr("cx", (d) => d.initialX)
            .attr("cy", (d) => d.initialY)
            .attr("r", 5)
            .attr("fill", (d) => getColor(d))
            .on("click", (e, d) => {this.handleClick(d)})
            .attr("stroke", "black")
            .attr("stroke-width", (d) => { 
               console.log("Checking RawTweet:", d.RawTweet);
              console.log("Current currTweets:", this.state.currTweets);
              if (this.state.currTweets.includes(d.RawTweet)) {
                console.log('um')
                return 2
              }
              else {
                console.log('current tweets', this.state.currTweets)
                return 0
              }
            }),
        (update) =>
          update
            .attr("cx", (d) => d.initialX)
            .attr("cy", (d) => d.initialY)
            .attr("stroke", "black").attr("stroke-width", (d) => {
              console.log(this.state.currTweets[0] === d.RawTweet)
              console.log("Checking RawTweet:", d.RawTweet);
              console.log("Current currTweets:", this.state.currTweets);
              if (this.state.currTweets.includes(d.RawTweet)) {
                console.log('um')
                return 2
              }
              else {
                
              console.log(this.state.currTweets)
                return 0
              }
            }),
        (exit) => exit.remove()
      );

      const simulation = d3.forceSimulation(tweetM)
        .force("x", d3.forceX(svgWidth / 2).strength(0.02))
        .force("y", d3.forceY(monthsScale(month) + monthsScale.bandwidth() / 2).strength(0.5))
        .force("collide", d3.forceCollide(6))
        .on("tick", () => {
          svg.selectAll(`.circle-${month}`)
            .data(tweetM, (d) => d.idx)
            .transition()
            .duration(30)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
        });
      
    monthsList.forEach((month) => {
      const yCenter = monthsScale(month) + monthsScale.bandwidth() / 2;
      svg.selectAll(`.monthText-${month}`)
        .data([month])
        .join("text")
        .attr("class", `monthText-${month}`)
        .attr("x", 20)
        .attr("y", yCenter)
        .text(month)
        .attr("font-size", "14px")
        .attr("font-weight", "bold");
    });/*
    const positionRects = Array.from({length: 20}, (_, i) => i);
      const sentScale = d3.scaleLinear().domain([0,19]).range([-1, 1])
      const posScaleSent = d3.scaleLinear([-1,1]).range([svgHeight - 50, 50])
      
      const subjScale = d3.scaleLinear().domain([0,19]).range([0, 1])
      const posScaleSubj = d3.scaleLinear([0,1]).range([svgHeight - 50, 50])

      const sentLegendSvg = svg.selectAll(".sentLegend")
      .data([0])
      .join("g")
      .attr("class", "sentLegend")
      .attr("transform", `translate(${svgWidth - 100}, 0)`);

      const subjLegendSvg = svg
      .selectAll(".subjLegend")
      .data([0])
      .join("g")
      .attr("class", "subjLegend")
      .attr("transform", `translate(${svgWidth - 100}, 0)`);
      console.log('ss',sentScale(0))
      console.log('ss',sentScale(1))
      sentLegendSvg.selectAll("rect").data(positionRects).join("rect").attr("x", 0).attr("y", (d) => posScaleSent(sentScale(d))/2 + 20)
      .attr("height", (posScaleSent(sentScale(0)) - posScaleSent(sentScale(1)))/2).attr("width", 50).attr("fill", d => sentimentColorScale(sentScale(d)))
      .attr("opacity", () => {
        if (this.state.currCol === "Sentiment") {
          return 1
        } else {
          return 0
        }})
      subjLegendSvg.selectAll("rect").data(positionRects).join("rect").attr("x", 0).attr("y", (d) => posScaleSubj(subjScale(d)))
      .attr("height", (posScaleSubj(subjScale(0)) - posScaleSubj(subjScale(1)))/2).attr("width", 50).attr("fill",  d => subjectivityColorScale(subjScale(d))/2 + 20)
      .attr("opacity", () => {
        if (this.state.currCol === "Subjectivity") {
          return 1
        } else {
          return 0
        }})*/

          const sentScale = d3.scaleLinear().domain([0,19]).range([-1, 1])
          const posScaleSent = d3.scaleLinear([-1,1]).range([svgHeight - 50, 50])
          
          const subjScale = d3.scaleLinear().domain([0,19]).range([0, 1])
          const posScaleSubj = d3.scaleLinear([0,1]).range([svgHeight - 50, 50])
          const positionRects = Array.from({ length: 20 }, (_, i) => i);

          const sentScaleValues = positionRects.map((d) => sentScale(d));
          const subjScaleValues = positionRects.map((d) => subjScale(d));
          
          const rectHeight = (posScaleSent(sentScale(0)) - posScaleSent(sentScale(1))) / 2;
          
          const sentLegendSvg = svg.selectAll(".sentLegend")
            .data([0])
            .join("g")
            .attr("class", "sentLegend")
            .attr("transform", `translate(${svgWidth - 120}, 0)`);
          
          sentLegendSvg.selectAll("rect")
            .data(sentScaleValues)
            .join("rect")
            .attr("x", 0)
            .attr("y", (_, i) => posScaleSent(sentScaleValues[i]) / 2 + 20)
            .attr("height", rectHeight)
            .attr("width", 50)
            .attr("fill", (d) => sentimentColorScale(d))
            .attr("opacity", () => (this.state.currCol === "Sentiment" ? 1 : 0))
            .attr("class", "legendRect");
          
          const subjLegendSvg = svg.selectAll(".subjLegend")
            .data([0])
            .join("g")
            .attr("class", "subjLegend")
            .attr("transform", `translate(${svgWidth - 170}, 0)`);
          
          subjLegendSvg.selectAll("rect")
            .data(subjScaleValues)
            .join("rect")
            .attr("x", 50)
            .attr("y", (_, i) => posScaleSubj(subjScaleValues[i]) - 6)
            .attr("height", rectHeight)
            .attr("width", 50)
            .attr("fill", (d) => subjectivityColorScale(d))
            .attr("opacity", () => (this.state.currCol === "Subjectivity" ? 1 : 0))
            .attr("class", "legendRect");
            
    });

    const textOne = svg.selectAll("#textOne").data([0]).join("text").attr("id", "textOne").attr("x", 732).attr("y", 50).attr("class", "small")
    const textTwo = svg.selectAll("#textTwo").data([0]).join("text").attr("id", "textOne").attr("x", 732).attr("y", 360).attr("class", "small")

    if (this.state.currCol === "Sentiment") {
      textOne.text("Positive")
      textTwo.text("Negative")
    }
    else {
      textOne.text("Subjective")
      textTwo.text("Objective")
    }
  }

  updateColors = () => {
    const { currCol } = this.state;

    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);

    const getColor = (d) => {
      if (currCol === "Sentiment") {
        return sentimentColorScale(d["Sentiment"])
      }
      else {
        return subjectivityColorScale(d["Subjectivity"])
      }
    }
    d3.selectAll("circle").attr('fill', d => getColor(d))
  }
  updateLegendColors = () => {
    const { currCol } = this.state;
  
    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);
  
    const sentLegendSvg = d3.select(".sentLegend");
    const subjLegendSvg = d3.select(".subjLegend");
  
    sentLegendSvg
      .selectAll("rect")
      .attr("fill", (d) => sentimentColorScale(d))
      .attr("opacity", () => (currCol === "Sentiment" ? 1 : 0)); 
  
    subjLegendSvg
      .selectAll("rect")
      .attr("fill", (d) => subjectivityColorScale(d))
      .attr("opacity", () => (currCol === "Subjectivity" ? 1 : 0));
      
  };
  updateText = () => {
    const svg = d3.select("#container").select("svg");
  
    const textOne = svg.selectAll("#textOne").data([0]).join("text")
      .attr("id", "textOne")
      .attr("x", 732)
      .attr("y", 50)
      .attr("class", "small");
  
    const textTwo = svg.selectAll("#textTwo").data([0]).join("text")
      .attr("id", "textTwo") // Fixed duplicate ID
      .attr("x", 732)
      .attr("y", 360)
      .attr("class", "small");
  
    if (this.state.currCol === "Sentiment") {
      textOne.text("Positive");
      textTwo.text("Negative");
    } else {
      textOne.text("Subjective");
      textTwo.text("Objective");
    }
  };
  

  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.tweetData !== this.state.tweetData) {
      this.createViz();
    }
    if (prevState.currCol !== this.state.currCol) {
      this.updateColors();
      this.updateLegendColors();
      this.updateText();
    }
  }

  render() {
    return (
      [
        <FileUpload onFileUpload={this.handleFileUpload}></FileUpload>,
        <div style={{ "margin-left": "20px", "margin-top": "20px" }} >
          <label for="currCol">
            <b>Color By:   </b>
          </label>
          <select id="currCol" onChange={(e) => this.setState({ currCol: e.target.value })}>
            <option value="Sentiment">Sentiment</option>
            <option value="Subjectivity">Subjectivity</option>
          </select>
        </div>,
        <div id="container"></div>,
        <div id = "toAdd">
          <ul>
            {this.state.currTweets.map((tweet, index) => (
              <li key={index}>{tweet}</li>
            ))}
          </ul>
        </div>,
      ]
    )
  }
}

export default App;
