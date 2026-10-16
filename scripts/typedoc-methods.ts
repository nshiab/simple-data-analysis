import { PageKind, ReflectionKind, Slugger } from "typedoc";
import type { Application, PageDefinition, Reflection } from "typedoc";
import { MemberRouter } from "typedoc-plugin-markdown";

// Keep class overviews, but give methods and accessors their own Markdown pages.
class MethodRouter extends MemberRouter {
  override getPageKind(target: Reflection) {
    return target.kindOf(ReflectionKind.Method | ReflectionKind.Accessor)
      ? PageKind.Reflection
      : super.getPageKind(target);
  }

  override buildChildPages(target: Reflection, pages: PageDefinition[]) {
    if (target.kindOf(ReflectionKind.Method | ReflectionKind.Accessor)) {
      const url = this.getFileName(this.getIdealBaseName(target));
      this.fullUrls.set(target, url);
      this.sluggers.set(target, new Slugger(this.sluggerConfiguration));
      pages.push({ kind: PageKind.Reflection, model: target, url });
      target.traverse((child) => {
        this.buildChildPages(child, pages);
        return true;
      });
    } else {
      super.buildChildPages(target, pages);
    }
  }

  override getIdealBaseName(target: Reflection): string {
    if (target.parent && target.kindOf(ReflectionKind.Method | ReflectionKind.Accessor)) {
      return `${super.getIdealBaseName(target.parent)}/${this.getReflectionAlias(target)}`;
    }
    return super.getIdealBaseName(target);
  }
}

export function load(app: Application) {
  app.renderer.defineRouter("methods", MethodRouter);
}
