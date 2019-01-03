import React from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

const Empty = ({ staticContext, classes }) => {
  if (staticContext) {
    staticContext.notFound = true;
  }
  return (
    <Typography className={classes.root}>
      The page you’re looking for can’t be found.
    </Typography>
  );
};

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