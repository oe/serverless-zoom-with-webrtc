
import * as React from 'react';
import { hot } from "react-hot-loader/root";

interface Props {
  name?: string
}

class App extends React.Component<Props> {
  render() {
    const { name } = this.props;
    return (
      <>
        <h1>
          Hello {name || 'Saiya'}
        </h1>
      </>
    );
  }
}

export default hot(App);
