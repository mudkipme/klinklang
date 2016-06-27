import Router from 'koa-router';
import send from 'koa-send';
import sass from 'node-sass';
import pg from 'polygoat';

const router = new Router();

router.get('/scss', async function (ctx, next) {
  await send(ctx, '/index.html', { root: __dirname + '/../../public' });
  console.log(ctx);
});

router.post('/api/scss', async function (ctx, next) {
  const { css, map } = await pg(sass.render.bind(sass, {
    data: ctx.request.body.text || '',
    outputStyle: 'compressed'
  }));
  ctx.body = { text: css.toString().split('}').join('}\n') };
});

export default router;