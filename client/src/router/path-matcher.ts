/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

const PARAM_REGEX = /:[a-z]+/gi;

export default class PathMatcher {
  constructor(public locationPath: string) {}

  match(path: string) {
    const params: Record<string, string> = {};
    const parameterNames = this.parameterNames(path);

    if (parameterNames.length) {
      const values = this.createRegExp(path, parameterNames).exec(this.locationPath);
      if (!values) return null;
      for (let i = 0; i < parameterNames.length; i++) {
        params[parameterNames[i]] = values[i + 1];
      }
      return params;
    } else {
      return path === this.locationPath ? {} : null;
    }
  }

  parameterNames(path: string) {
    const names = [];
    let result;
    while ((result = PARAM_REGEX.exec(path))) {
      names.push(result[0].substring(1));
    }
    return names;
  }

  createRegExp(path: string, parameterNames: string[]) {
    let regExpStr = '^' + path;
    for (const name of parameterNames) {
      regExpStr = regExpStr.replace(`:${name}`, `([^/]+)`);
    }
    return new RegExp(regExpStr);
  }
}
