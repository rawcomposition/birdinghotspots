import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-sm text-center mx-auto mt-[20vh]">
          <h2 className="text-xl text-gray-600">Sorry! Something went wrong...</h2>
          <p className="my-6">
            <button href="javascript:void(0)" className="text-orange-700" onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
