import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { MenuItem } from "@material-ui/core/Menu";
import { FormControlLabel } from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";
import { withStyles } from "@material-ui/core/styles";
import { compose } from "recompose";
import every from "lodash/every";
import { selectItem, selectAll, changeSourceLng, changeResultLng, convertText } from "../../actions/replace";

class Replace extends Component {
  render() {
    const { classes, languages, texts, sourceLng, resultLng, result, selectedAll } = this.props;
    return (
      <div className={classes.root}>
        <Grid container>
          <Grid item xs={6} sm={5}>
            <TextField select label="From" fullWidth value={sourceLng} onChange={this.handleChangeSourceLng}>
              {languages.map(item => (
                <MenuItem key={item.value} value={item.value}>{item.text}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={5}>
            <TextField select label="To" fullWidth value={resultLng} onChange={this.handleChangeResultLng}>
              {languages.map(item => (
                <MenuItem key={item.value} value={item.value}>{item.text}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button raised color="primary" className={classes.translateButton} onClick={this.handleButtonClick} >
              Replace
            </Button>
          </Grid>
        </Grid>
        <Grid container>
          {texts.map(item => (
            <Grid item xs={6} sm={2} key={item.value}>
              <FormControlLabel
                control={
                  <Checkbox checked={item.selected} value={item.value} onChange={this.handleChangeText} />
                }
                label={item.text}
              />
            </Grid>
          ))}
          <Grid item xs={6} sm={2}>
            <FormControlLabel
              control={
                <Checkbox checked={selectedAll} onChange={this.handleChangeAll} />
              }
              label="Select All"
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container>
          <Grid item xs={12} sm={6}>
            <TextField label="Source" fullWidth multiline rows={10} rowsMax={10}
              inputRef={ele => this._sourceTextField = ele}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Result" fullWidth multiline disabled value={result} rows={10} rowsMax={10} />
          </Grid>
        </Grid>
      </div>
    );
  }

  handleChangeSourceLng = e => {
    this.props.changeSourceLng(e.target.value);
  };

  handleChangeResultLng = e => {
    this.props.changeResultLng(e.target.value);
  }

  handleChangeText = e => {
    this.props.selectItem(e.target.value);
  }

  handleChangeAll = () => {
    this.props.selectAll();
  }

  handleButtonClick = () => {
    this.props.convertText(this._sourceTextField.value);
  }
}

const mapStateToProps = (state) => ({
  languages: state.replace.languages,
  texts: state.replace.texts,
  sourceLng: state.replace.sourceLng,
  resultLng: state.replace.resultLng,
  result: state.replace.result,
  selectedAll: every(state.replace.texts, "selected")
});

const mapDispatchToProps = (dispatch) => ({
  selectItem: (id) => dispatch(selectItem(id)),
  selectAll: () => dispatch(selectAll()),
  convertText: (source) => dispatch(convertText(source)),
  changeSourceLng: (sourceLng) => dispatch(changeSourceLng(sourceLng)),
  changeResultLng: (resultLng) => dispatch(changeResultLng(resultLng))
});

const styles = {
  root: {
    maxWidth: "62.5rem",
    margin: "0 auto"
  },
  translateButton: {
    width: "100%"
  },
  divider: {
    marginBottom: "1rem"
  }
};

Replace.propTypes = {
  classes: PropTypes.object.isRequired,
  languages: PropTypes.array.isRequired,
  texts: PropTypes.array.isRequired,
  sourceLng: PropTypes.string.isRequired,
  resultLng: PropTypes.string.isRequired,
  result: PropTypes.string.isRequired,
  selectedAll: PropTypes.bool.isRequired,
  selectItem: PropTypes.func.isRequired,
  selectAll: PropTypes.func.isRequired,
  convertText: PropTypes.func.isRequired,
  changeSourceLng: PropTypes.func.isRequired,
  changeResultLng: PropTypes.func.isRequired
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Replace);