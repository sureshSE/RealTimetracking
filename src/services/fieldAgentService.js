import httpService from '../utils/http'

class FieldAgentService {

    async getFieldList(data) {
        return httpService.post(`api/fieldAgent/getAllFieldAgentDetailsInShort`, data)
    }

    async filterLivetracting(data) {
        return httpService.post(`api/tracking/Location`, data)
    }



    async getSingleFieldAgent(id) {
        return httpService.get(`/api/fieldAgent/getAgentById/${id}`)
    }

    async deleteFieldAgent(id) {
        return httpService.delete(`api/fieldAgent/deleteFieldAgentById/${id}`)
    }

    async updateFieldAgent(id, data) {
        return httpService.put(`api/fieldAgent/updateFieldAgentById/${id}`, data)
    }

    async updateFieldAgent(id, data) {
        return httpService.put(`api/fieldAgent/updateFieldAgentById/${id}`, data)
    }

    async getRole() {
        return httpService.get(`api/role/getRoles`)
    }

    async getTeams(data) {
        return httpService.post(`api/teams/getAllTeamDetail`, data,)
    }


    async getRouteAnalysis(data) {
        return httpService.post(`api/liveTrackingId/getAllLiveTrackingIdDetails`, data,)
    }

    async getPlaceOfInterestDetails(data) {
        return httpService.post(`api/placeOfInterest/getPlaceOfInterestDetailWithOrWithoutFilters`, data,)
    }

    async getFrequent(data) {
        return httpService.post(`api/manualLogin/getAllManualLogins`, data,)
    }





}

export default new FieldAgentService()

