const doesValObject = (val) =>
  typeof val === "object" && val !== undefined && val !== null;

const doesValNumber = (val) =>
  typeof val === "number" && val !== undefined && val !== null;

const styleObjectToString = (style) => {
  return Object.keys(style).reduce(
    (acc, key) => acc + camelCaseToCssProp(key, style[key]),
    ""
  );
};

const camelCaseToCssProp = (key, style) => {
  if (doesValNumber(style)) {
    return (
      key
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      style +
      "px;\n"
    );
  } else {
    return (
      key
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      style +
      ";\n"
    );
  }
};

// normally if it's a style object one key give an idea about other keys directly
const isLastNest = (objectOrVal) => {
  let status = true;
  if (!doesValObject(objectOrVal)) return true;
  Object.keys(objectOrVal).forEach((k) => {
    if (doesValObject(objectOrVal[k])) {
      status = false;
      return;
    }
  });
  return status;
};

// treat key and his childs
const convertNestedStylesToCssString = (key, style) => {
  let result = "";
  if (isLastNest(style)) {
    result = result + `${styleObjectToString(style)}`;
  } else {
    result = result + jssToCss(style);
  }
  return result;
};

// treat all json keys
export default function jssToCss(json) {
  let result = "";
  Object.keys(json).forEach((key) => {
    if (doesValObject(json[key])) {
      result += `
.${key} {
  ${convertNestedStylesToCssString(key, json[key])}}`;
    } else {
      result = result + camelCaseToCssProp(key, json[key]);
    }
  });
  return result;
}
