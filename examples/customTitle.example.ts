import { TemplateContext } from '../src/domain/models/Template';

export default async function (context: TemplateContext) {
  const date = new Date().toLocaleDateString();
  return `[${date}] ${context.fileName} by ${context.author}`;
}
