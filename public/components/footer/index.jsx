import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

const Footer = ({ classes }) => (
  <Grid container className={classes.root} component="footer">
    <Grid item xs={12} component={Typography} type="body1" className={classes.text}>
      &copy; <a className={classes.link} href="https://wiki.52poke.com/">52Poké Wiki</a>
    </Grid>
  </Grid>
);

const styles = {
  root: {
    marginTop: "1rem",
    marginBottom: "1rem",
    justifyContent: "center"
  },
  text: {
    maxWidth: "62.5rem"
  },
  link: {
    color: "inherit",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline"
    }
  }
};

Footer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Footer);