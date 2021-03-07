import parse from "./libs/css-parse";
import { camelCase } from "lodash";

/**
 * Convert css to jss.
 *
 * @param {Object} params
 * @return {Object}
 * @api public
 */

interface IParams {
  code: string;
  unit: any;
  dashes: any;
}

export default function (params: IParams): string {
  const code: string = params.code;
  const ast = parse(code);
  let styles: string = "";
  if (ast.stylesheet && ast.stylesheet.rules) {
    const rules = ast.stylesheet.rules;
    styles = toJssRules(rules, params);
  }
  return styles;
}

/**
 * Convert rules from css ast to jss style.
 *
 * @param {Array} cssRules
 * @param {Object} params
 * @return {Object}
 */

function stripUnit(value: any, params: IParams) {
  if (
    !params.unit ||
    // Detect a compound/multi value.
    /\s|,/.test(value)
  )
    return value;
  const unit = value.substr(value.length - params.unit.length);
  const num = parseFloat(value);
  if (unit === params.unit && num !== NaN) {
    return num;
  }
  return value;
}

function addRule(rule: any, rules: any[], params: IParams) {
  if (rule.type === "comment") return;
  let key = rule.selectors.join(", ");
  // kick css class dot or dash
  if (key.charAt(0) === "." || key.charAt(0) === "#") key = key.substring(1);
  const style = rules[key] || (rules[key] = {});
  rule.declarations.forEach(function (decl: any) {
    if (decl.type === "comment") return;
    const property = formatProp(decl.property, params);
    if (property in style) {
      const fallbacks = style.fallbacks || (style.fallbacks = []);
      fallbacks.splice(0, 0, { [property]: style[property] });
    }
    style[property] = stripUnit(decl.value, params);
    if (typeof style[property] === "string") {
      style[property] = style[property].replace(/\\/g, "\\\\");
    }
  });
}

function formatProp(prop: any, params: IParams) {
  if (!params.dashes) {
    prop = camelCase(prop);
    // Capitalize the first character
    if (prop.substring(0, 1) === "-")
      prop = prop.charAt(0).toUpperCase() + prop.slice(1);
  }
  return prop;
}

function toJssRules(cssRules: any[], params: IParams) {
  const jssRules: any = {};
  cssRules.forEach(function (rule) {
    if (rule.type === "comment") return;
    switch (rule.type) {
      case "rule":
        addRule(rule, jssRules, params);
        break;
      case "media": {
        const key = "@media " + rule.media;
        const value = jssRules[key] || (jssRules[key] = {});
        rule.rules.forEach(function (rule: any) {
          addRule(rule, value, params);
        });
        break;
      }
      case "font-face": {
        const key = "@" + rule.type;
        const value = jssRules[key] || (jssRules[key] = {});
        rule.declarations.forEach(function (decl: any) {
          value[formatProp(decl.property, params)] = decl.value;
        });
        break;
      }
      case "keyframes": {
        const key = "@" + rule.type + " " + rule.name;
        const value = jssRules[key] || (jssRules[key] = {});
        rule.keyframes.forEach(function (keyframe: any) {
          const frameKey = keyframe.values.join(", ");
          const frameValue = value[frameKey] || (value[frameKey] = {});
          keyframe.declarations.forEach(function (decl: any) {
            frameValue[formatProp(decl.property, params)] = stripUnit(
              decl.value,
              params
            );
          });
        });
      }
    }
  });

  return `
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => 
(${JSON.stringify(jssRules, null, 2)}));
`;
}
