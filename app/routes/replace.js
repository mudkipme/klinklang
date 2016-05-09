import Router from 'koa-router';
import replacer from '../lib/replacer';

const router = new Router();

router.post('/api/replace', async (ctx, next) => {
  ctx.body = await replacer(ctx.request.body.source || '', {
    texts: ctx.request.body.texts || [],
    sourceLng: ctx.request.body.sourceLng,
    resultLng: ctx.request.body.resultLng
  });
});

export default router;