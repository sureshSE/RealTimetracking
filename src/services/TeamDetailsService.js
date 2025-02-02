import httpService from "../utils/http";

class teamDetailsService {
  // async getFieldList(data) {
  //     return httpService.post(`api/fieldAgent/getAllFieldAgentDetails`, data)
  // }

  async getAllTeamList(data) {
    return httpService.post(`/api/teams/getTeamsById`, { data });
  }

  // async deleteFieldAgent(id) {
  //     return httpService.delete(`api/fieldAgent/deleteFieldAgentById/${id}`)
  // }

  // async updateFieldAgent(id, data) {
  //     return httpService.put(`api/fieldAgent/updateFieldAgentById/${id}`, data)
  // }
}

export default new teamDetailsService();
