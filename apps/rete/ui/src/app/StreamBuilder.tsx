import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

interface StreamBuilderProps<T> {
  stream$: Observable<T>;
  children: (state: SnapShot<T>) => React.ReactNode;
  initialState?: T;
}

export enum StreamStatus {
  pending,
  active,
  error,
}

type SnapShot<T> = {
  data: T | null;
  error: Error | null;
  status: StreamStatus;
};

const createSnapshot = <T,>(
  data: T | null,
  status: StreamStatus,
  error: Error | null = null,
) =>
({
  data,
  status,
  error,
} as SnapShot<T>);

export const isPending = (status: StreamStatus) =>
  status === StreamStatus.pending;

export const StreamBuilder = <T,>(props: StreamBuilderProps<T>) => {
  const { stream$, children, initialState = null } = props;
  const [streamState, setStreamState] = useState<SnapShot<T>>(
    createSnapshot(initialState, StreamStatus.pending),
  );

  useEffect(() => {
    const sub = stream$.subscribe({
      next: (data) => setStreamState(createSnapshot(data, StreamStatus.active)),
      error: (error) => {
        setStreamState(createSnapshot<T>(null, StreamStatus.error, error));
      },
    });
    return () => {
      sub.unsubscribe();
    };
  }, [stream$, setStreamState]);

  return <>{children(streamState)}</>;
};
