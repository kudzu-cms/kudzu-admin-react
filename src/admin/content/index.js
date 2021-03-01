import React from "react"
import axios from "axios"

import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Grid,
  MenuItem,
  MenuList,
  Paper, Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";

class Content extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      contentTypes: [],
      selectedType: "",
      contentList: [],
    };

    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  componentDidMount() {
    this.getContentTypes();
  }

  getContentOfType(type) {
    axios.get(`${KUDZU_BASE_URL}/api/contents?type=${type}`, {
      withCredentials: false,
    })
    .then(response => {
      console.log(response)
      if (response.status === 200) {
        this.setState({contentList: response.data.data})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }

  getContentTypes() {
    axios.get(`${KUDZU_BASE_URL}/admin/contents/meta`, {
      withCredentials: true,
    })
    .then(response => {
      console.log(response)
      if (response.status === 200) {
        let types = Object.keys(response.data)
        this.setState({
          contentTypes: types,
          selectedType: types[0],
        }, this.getContentOfType(types[0]))
      }
    })
    .catch(error => {
      console.error(error)
    })
  }

  handleMenuClick(event) {
    let type = event.target.innerText;
    this.setState({selectedType: type})
    console.log(type)
  }

  render() {
    return (
      <>
      { this.state.contentTypes.length > 0 &&
        <>
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <Sidebar
              contentTypes={this.state.contentTypes}
              clickHandler={this.handleMenuClick}
            />
          </Grid>
          <Grid item xs={9}>
            <ContentListTable contentList={this.state.contentList} />
          </Grid>
        </Grid>
        </>
      }
      </>
    );
  }
}

function Sidebar({contentTypes, clickHandler}) {
  return (
    <MenuList>
      { contentTypes.map(name => {
          return <MenuItem key={name} onClick={clickHandler}>{ name }</MenuItem>
        })
      }
    </MenuList>
  )
}

function ContentListTable({contentList}) {

  if (contentList.length === 0) {
    return null;
  }

  let header = Object.keys(contentList[0]);
  return(
    <TableContainer>
    <Table size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          { header.map(value => {
            return <TableCell align="right">{ value } </TableCell>
          })

          }
        </TableRow>
      </TableHead>
      <TableBody>
        { contentList.map(value => {
            return(
              <TableRow key={value.uuid}>
                <TableCell align="right">{value.uuid}</TableCell>
                <TableCell align="right">{value.id}</TableCell>
                <TableCell align="right">{value.slug}</TableCell>
                <TableCell align="right">{value.timestamp}</TableCell>
                <TableCell align="right">{value.updated}</TableCell>
                <TableCell align="right">{value.title}</TableCell>
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  </TableContainer>
  )
}

export default Content
