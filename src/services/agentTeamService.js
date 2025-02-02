import httpService from '../utils/http'

class TeamAgentService {

    async getTeamList(data) {
        return httpService.post(`api/teams/getAllTeamDetail`, data)
    }

    async getSingleTeamAgent(id) {
        return httpService.get(`/api/fieldAgent/getAgentById/${id}`)
    }

    async getByIdTeam(id) {
        return httpService.get(`/api/teams/getTeamById/${id}`)
    }

    async deleteTeamAgent(id) {
        return httpService.delete(`api/teams/deleteTeamById/${id}`)
    }

    async updateTeamAgent(id, data) {
        return httpService.put(`api/teams/editTeamDetail/${id}`, data)
    }
}

export default new TeamAgentService()

