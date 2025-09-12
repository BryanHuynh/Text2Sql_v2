import type { UserFile, UserFilesAPIResponse } from "./userfiles.types";

export function mapUserFilesFromAPI(resp: UserFilesAPIResponse): UserFile[] {
    return resp.data.map((data) => ({
        id: data.id,
        filename: data.filename,
        created_at: data.created_at,
        content: data.content,
    }));
}