require 'rails_helper'

RSpec.describe 'Api::TimeSlots' do
  describe 'GET /api/time_slots' do
    before do
      create(:time_slot, starts_at: 1.day.from_now.change(hour: 19, min: 0))
      create(:time_slot, starts_at: 2.days.from_now.change(hour: 19, min: 0))
    end

    context 'without authentication (public)' do
      it 'returns all time slots' do
        get '/api/time_slots'

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body['data'].length).to eq(2)
        expect(body['meta']['total']).to eq(2)
      end
    end

    context 'with date_from and date_to filters' do
      let(:target_date) { 1.day.from_now.to_date }

      it 'returns filtered time slots' do
        get '/api/time_slots', params: { date_from: target_date.to_s, date_to: target_date.to_s }

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body['data'].length).to eq(1)
        expect(body['meta']['date_from']).to eq(target_date.to_s)
        expect(body['meta']['date_to']).to eq(target_date.to_s)
      end
    end

    context 'without filters' do
      it 'returns all slots with nil date_from and date_to in meta' do
        get '/api/time_slots'

        body = response.parsed_body
        expect(body['meta']['date_from']).to be_nil
        expect(body['meta']['date_to']).to be_nil
      end
    end
  end

  describe 'GET /api/time_slots/:id' do
    let(:time_slot) { create(:time_slot) }

    context 'when authenticated' do
      let(:user) { create(:user) }

      before { sign_in_as(user) }

      it 'returns the time slot' do
        authenticated_get "/api/time_slots/#{time_slot.id}"

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body['data']['id']).to eq(time_slot.id)
        expect(body['data']['starts_at']).to be_present
        expect(body['data']['ends_at']).to be_present
        expect(body['data']['status']).to eq('available')
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get "/api/time_slots/#{time_slot.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when time slot does not exist' do
      let(:user) { create(:user) }

      before { sign_in_as(user) }

      it 'returns not found' do
        authenticated_get '/api/time_slots/0'

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
