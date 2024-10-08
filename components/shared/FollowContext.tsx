import { createContext, Dispatch, SetStateAction } from 'react';

export type OrgFollowStatus = Record<string, boolean>

interface FollowContextType {
    orgFollowGroup: OrgFollowStatus,
    setOrgFollowGroup: Dispatch<SetStateAction<OrgFollowStatus>>
}

export const FollowContext = createContext<FollowContextType>({
    orgFollowGroup: {} , 
    setOrgFollowGroup: ()=>{} 
});

