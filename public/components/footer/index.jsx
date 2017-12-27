import React from "react";
import PropTypes from "prop-types";
import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import { withStyles } from "material-ui/styles";

const Footer = ({ classes }) => (
  <Grid container className={classes.root} component="footer">
    <Grid item xs={12} component={Typography} type="body1">
      &copy; <a className={classes.link} href="https://wiki.52poke.com/">52Poké Wiki</a>
    </Grid>
  </Grid>
);

const styles = {
  root: {
    maxWidth: "62.5rem",
    margin: "1rem auto"
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