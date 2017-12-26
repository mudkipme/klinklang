import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Grid, AppBar, Typography, Toolbar, Button, withStyles } from "material-ui";

const MainAppBar = ({ classes }) => (
  <Grid container>
    <AppBar position="static" className={classes.root}>
      <Toolbar>
        <Typography type="title" color="inherit" className={classes.title}>神奇宝贝百科工具台</Typography>
        <Button component={Link} to="/" color="contrast">名词转换器</Button>
      </Toolbar>
    </AppBar>
  </Grid>
);

const styles = {
  root: {
    marginBottom: "1.875rem"
  },
  title: {
    flex: 1
  }
};

MainAppBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MainAppBar);