const normalize = (err: Error | string): Error => {
  if (typeof err === 'string') {
    return new Error(err);
  }
  return err;
};

const defaultErrorHandler = (err: Error) => { throw err; };

export default function createErrorHandler(app: any) { // TODO: app type
  return (err: string | Error) => {
    if (err) {
      const handler: (err: Error, ...rest: any[]) => void = app.plugin.apply('onError', defaultErrorHandler);
      handler(normalize(err), app);
    }
  };
};

export type ErrorHandler = ReturnType<typeof createErrorHandler>;