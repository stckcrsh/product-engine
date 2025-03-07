import { useCallback, useState } from 'react';

import { configService } from './ConfigService';

/**
 * Here we are asking to change the platformRepoPath
 * @param param0
 * @returns
 */
export const Settings = ({ platformRef: _platformRef = '' }: { platformRef: string }) => {
  const [platformRef, setPlatformRef] = useState<string>(_platformRef);

  const onChangeHandler = useCallback((event: any) => {
    setPlatformRef(event.target.value);
  }, []);

  const onBlurHandler = useCallback(() => {
    console.log('onBlurHandler');
  }, []);

  const onClickHandler = useCallback(() => {
    configService.set('platformRepoPath', platformRef);
  }, [platformRef])

  return (
    <div>
      <label>PlatformRef:
        <input type="text" onChange={onChangeHandler} onBlur={onBlurHandler} value={platformRef} />
      </label>
      <button onClick={onClickHandler}>Save</button>
    </div>
  );
}
