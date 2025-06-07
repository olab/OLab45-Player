// @flow
import parse from "html-react-parser";
import log from "loglevel";
import OlabTag from "../OlabTag";

class OlabCounterTag extends OlabTag {
  constructor(props) {
    let olabObject = props.props.dynamicObject.getCounter(props.name);
    super(props, olabObject);
  }

  render() {
    const { debug, olabObject } = this.state;
    const { id, name } = this.props;

    log.debug(`${this.constructor["name"]} render`);

    try {
      if (olabObject == null) {
        throw new Error(`'${name}' not found`);
      }

      if (debug.disableWikiRendering) {
        return (
          <>
            <b>
              [[{id}]] ({olabObject.id}) "{olabObject.value}"
            </b>
          </>
        );
      }

      if (olabObject.value == null) {
        olabObject.value = "";
      }

      const visibility = this.getDisplayStyle(olabObject);

      return (
        <div id={olabObject.htmlIdBase} style={{ display: visibility }}>
          {parse(olabObject.value.toString())}
        </div>
      );
    } catch (error) {
      return this.errorJsx(id, error);
    }
  }
}

export default OlabCounterTag;
