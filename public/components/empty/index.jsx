import React, { Component } from "react";
import PropTypes from "prop-types";
import Typography from "material-ui/Typography";
import { withStyles } from "material-ui/styles";

class Empty extends Component {
  componentWillMount() {
    const { staticContext } = this.props;
    if (staticContext) {
      staticContext.notFound = true;
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Typography className={classes.root}>
        The page you’re looking for can’t be found.
      </Typography>
    );
  }
}

const styles = {
  root: {
    height: "15rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

Empty.propTypes = {
  classes: PropTypes.object.isRequired,
  staticContext: PropTypes.object
};

export default withStyles(styles)(Empty);