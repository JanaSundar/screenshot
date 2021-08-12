import { useState, FormEvent } from 'react';
import axios from 'axios';
import Nprogress from 'nprogress';

Nprogress.configure({ showSpinner: false });

type response = {
  image: string;
  fileName: string;
};

const stringToSlug = (value: string) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const Screenshot = () => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [sizeState, setSize] = useState(0);
  const [fullPage, setFull] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const sizeProperty = ['width=1920&height=1080', 'width=1280&800', 'width=420&height=740'];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setDisabled(true);
      Nprogress.start();
      const slugifiedName = stringToSlug(name);
      const result = await axios.post<response>(`/api/screenshot?${sizeProperty[sizeState]}&fullPage=${fullPage}`, {
        url,
        name: slugifiedName,
      });

      const { image, fileName } = result.data;

      const downloadLink = document.createElement('a');

      downloadLink.href = `data:application/jpeg;base64,${image}`;
      downloadLink.download = fileName;
      downloadLink.click();

      setDisabled(false);
      Nprogress.done();
    } catch (err) {
      Nprogress.done();
      setDisabled(false);
      if (err?.response?.data) {
        const { data } = err.response;
        const message = data.err;
        console.log(message);
      }
    }
  };

  return (
    <>
      <form onSubmit={submit}>
        <div className="input-container">
          <input type="text" placeholder="Enter website url" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input type="text" placeholder="Enter Screenshot name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="rc-container">
          <div className="radio">
            <input type="radio" name="size" id="desktop" defaultChecked={true} onChange={(e) => setSize(parseInt(e.target.defaultValue))} value={0} />
            <label className="radio-label" htmlFor="desktop">
              Desktop
            </label>
          </div>
          <div className="radio">
            <input type="radio" name="size" id="tablet" value={1} onChange={(e) => setSize(parseInt(e.target.defaultValue))} />
            <label className="radio-label" htmlFor="tablet">
              Tablet
            </label>
          </div>
          <div className="radio">
            <input type="radio" name="size" id="phone" value={2} onChange={(e) => setSize(parseInt(e.target.defaultValue))} />
            <label className="radio-label" htmlFor="phone">
              Phone
            </label>
          </div>
          <div className="checkbox">
            <input type="checkbox" id="fullpage" defaultChecked={fullPage} onChange={(e) => setFull(!fullPage)} />
            <label htmlFor="fullpage" /> <span>Full Page</span>
          </div>
        </div>
        <div className="btn-container">
          <button type="submit" disabled={disabled} className="btn">
            Take Screenshot
          </button>
        </div>
      </form>
    </>
  );
};

export default Screenshot;
