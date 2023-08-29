import Handlebars from 'handlebars'

Handlebars.registerHelper('encodeURICompoonent', encodeURIComponent)
Handlebars.registerHelper('decodeURICompoonent', decodeURIComponent)
Handlebars.registerHelper('stripHTML', (text: string) => text.replace(/<[^>]*>?/gm, ''))

export function render (template: string, context: Record<string, unknown>): string {
  const render = Handlebars.compile(template)
  return render(context)
}
