import React, {Component} from 'react';
class FileUpload extends Component {
    constructor(props) {
      super(props);
      this.state = {
        file: null,
        jsonData: null,
      };
    }
  
    handleFileSubmit = (event) => {
      event.preventDefault();
      const { file } = this.state;
  
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const json = JSON.parse(e.target.result);
          this.setState({jsonData: json})
          console.log("jd", json)
          this.props.onFileUpload(json)
        };
        reader.readAsText(file);
      }
    };
    /*
    csvToJson = (csv) => {
      const lines = csv.split("\n");
      const headers = lines[0].split(",").map(header => header.trim())
      
      return lines
    };
  
    getHeaders = (csv) => {
      const lines = csv.split("\n");
      return lines[0].split(",").map((header) => header.trim());
    };
  */
    render() {
      return (
        <div style={{backgroundColor: "#f0f0f0", padding: 20 }}>
          <h2>Upload a JSON File</h2>
          <form onSubmit={this.handleFileSubmit}>
            <input type="file" accept=".json" onChange={(event) => this.setState({ file: event.target.files[0] })} />
            <button type="submit">Upload</button>
          </form>
        </div>
      );
    }
  }
  
  export default FileUpload;
  