import Router from 'koa-router';
import sass from 'node-sass';
import pg from 'polygoat';

const router = new Router();

router.post('/api/scss', async function (ctx, next) {
  const { css, map } = await pg(sass.render.bind(sass, {
    data: ctx.request.body.text || '',
    outputStyle: 'compressed'
  }));
  ctx.body = css.toString().split('}').join('}\n');
});

export default router;