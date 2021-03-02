import React from "react"
import axios from "axios"

import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Button,
  Grid,
  MenuItem,
  MenuList,
  Table,
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
            <ContentListTable
              contentList={this.state.contentList}
              contentType={this.state.selectedType}
            />
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

function ContentListTable({contentList, contentType}) {

  if (contentList.length === 0) {
    return null;
  }

  let timestampFormatter = Intl.DateTimeFormat("default", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short"
  });

  return(
    <>
    <h1>Content</h1>
    <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          { ["UUID", "ID", "Slug", "Created", "Updated", "Edit", "Delete"].map(value => {
            return <TableCell key={value} align="left">{ value }</TableCell>
          })

          }
        </TableRow>
      </TableHead>
      <TableBody>
        { contentList.map(value => {
            return(
              <TableRow key={value.uuid}>
                <TableCell key={`${value.uuid}:uuid`} align="left">{ value.uuid }</TableCell>
                <TableCell key={`${value.uuid}:id`} align="left">{ value.id }</TableCell>
                <TableCell key={`${value.uuid}:slug`} align="left">{ value.slug }</TableCell>
                <TableCell key={`${value.uuid}:timestamp`} align="left">{ timestampFormatter.format(value.timestamp) }</TableCell>
                <TableCell key={`${value.uuid}:updated`} align="left">{ timestampFormatter.format(value.updated) }</TableCell>
                {/* @todo Use a single split button, see https://material-ui.com/components/button-group/#split-button */}
                <TableCell key={`${value.uuid}:edit`} align="left">
                  <Button color="primary" variant="contained" href={`/admin/content/${contentType.toLowerCase()}/${value.uuid}/edit`}>Edit</Button>
                </TableCell>
                <TableCell key={`${value.uuid}:delete`} align="left">
                  <Button color="secondary" variant="contained" href={`/admin/content/${contentType.toLowerCase()}/${value.uuid}/delete`}>Delete</Button>
                </TableCell>
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  </TableContainer>
  </>
  )
}

export default Content
