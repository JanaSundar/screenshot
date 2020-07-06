import { useState, FormEvent } from "react";
import axios from "axios";
import fileDowload from "js-file-download";
import Nprogress from "nprogress";

const stringToSlug = (value: string) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const Screenshot = () => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [sizeState, setSize] = useState(0);
  const [fullPage, setFull] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const sizeProperty = [
    "width=1920&height=1080",
    "width=1280&800",
    "width=420&height=740",
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setDisabled(true);
      Nprogress.start();
      const slugifiedName = stringToSlug(name);
      const result = await axios.post(
        `http://localhost:3000/api/screenshot?${sizeProperty[sizeState]}&fullPage=${fullPage}`,
        {
          url,
          name: slugifiedName,
        },
        {
          responseType: "arraybuffer",
        }
      );

      const resultData = await result.data;
      fileDowload(resultData, `${slugifiedName}_${Date.now()}.jpeg`);
      setDisabled(false);
      Nprogress.done();
    } catch (err) {
      Nprogress.done();
      setDisabled(false);
      if (err?.response?.data) {
        const { data } = err.response;
        const decodedString = String.fromCharCode.apply(
          null,
          new Uint8Array(data)
        );
        const obj = JSON.parse(decodedString);
        const message = obj["message"];
        console.log(message);
      }
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Enter website url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Screenshot name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="input-container">
          <div className="radio">
            <input
              type="radio"
              name="size"
              id="desktop"
              defaultChecked={true}
              onChange={(e) => setSize(parseInt(e.target.defaultValue))}
              value={0}
            />
            <label className="radio-label" htmlFor="desktop">
              Desktop
            </label>
          </div>
          <div className="radio">
            <input
              type="radio"
              name="size"
              id="tablet"
              value={1}
              onChange={(e) => setSize(parseInt(e.target.defaultValue))}
            />
            <label className="radio-label" htmlFor="tablet">
              Tablet
            </label>
          </div>
          <div className="radio">
            <input
              type="radio"
              name="size"
              id="phone"
              value={2}
              onChange={(e) => setSize(parseInt(e.target.defaultValue))}
            />
            <label className="radio-label" htmlFor="phone">
              Phone
            </label>
          </div>
          <input
            type="checkbox"
            id="fullpage"
            defaultChecked={fullPage}
            onChange={(e) => setFull(!fullPage)}
          />
          <label htmlFor="fullpage">Full page screenshot</label>

        </div>
          <button type="submit" disabled={disabled}>
            Take Screenshot
          </button>
      </form>
    </div>
  );
};

export default Screenshot;
