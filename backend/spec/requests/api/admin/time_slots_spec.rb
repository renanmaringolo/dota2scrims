require 'rails_helper'

RSpec.describe 'Api::Admin::TimeSlots' do
  let(:admin) { create(:user, :admin) }
  let(:manager) { create(:user, :manager) }

  describe 'POST /api/admin/time_slots' do
    let(:starts_at) { 2.days.from_now.change(hour: 19, min: 0) }
    let(:valid_params) do
      { time_slot: { starts_at: starts_at.iso8601, ends_at: (starts_at + 90.minutes).iso8601 } }
    end

    context 'when admin' do
      before { sign_in_as(admin) }

      it 'creates a time slot' do
        expect do
          authenticated_post '/api/admin/time_slots', params: valid_params
        end.to change(TimeSlot, :count).by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body['data']['status']).to eq('available')
      end
    end

    context 'when manager' do
      before { sign_in_as(manager) }

      it 'returns forbidden' do
        authenticated_post '/api/admin/time_slots', params: valid_params
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        post '/api/admin/time_slots', params: valid_params
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with invalid params' do
      before { sign_in_as(admin) }

      it 'returns unprocessable entity' do
        authenticated_post '/api/admin/time_slots', params: {
          time_slot: { starts_at: starts_at.iso8601, ends_at: (starts_at - 1.hour).iso8601 },
        }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  describe 'PATCH /api/admin/time_slots/:id' do
    let(:time_slot) { create(:time_slot, :available) }
    let(:new_ends_at) { time_slot.starts_at + 2.hours }

    context 'when admin updates available slot' do
      before { sign_in_as(admin) }

      it 'updates the time slot' do
        authenticated_patch "/api/admin/time_slots/#{time_slot.id}", params: {
          time_slot: { ends_at: new_ends_at.iso8601 },
        }

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body['data']['id']).to eq(time_slot.id)
      end
    end

    context 'when slot is booked' do
      let(:time_slot) { create(:time_slot, :booked) }

      before { sign_in_as(admin) }

      it 'returns conflict' do
        authenticated_patch "/api/admin/time_slots/#{time_slot.id}", params: {
          time_slot: { ends_at: new_ends_at.iso8601 },
        }

        expect(response).to have_http_status(:conflict)
      end
    end

    context 'when manager' do
      before { sign_in_as(manager) }

      it 'returns forbidden' do
        authenticated_patch "/api/admin/time_slots/#{time_slot.id}", params: {
          time_slot: { ends_at: new_ends_at.iso8601 },
        }

        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when slot not found' do
      before { sign_in_as(admin) }

      it 'returns not found' do
        authenticated_patch '/api/admin/time_slots/0', params: {
          time_slot: { ends_at: new_ends_at.iso8601 },
        }

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'DELETE /api/admin/time_slots/:id' do
    context 'when admin deletes available slot' do
      let!(:time_slot) { create(:time_slot, :available) }

      before { sign_in_as(admin) }

      it 'destroys the time slot' do
        expect do
          authenticated_delete "/api/admin/time_slots/#{time_slot.id}"
        end.to change(TimeSlot, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context 'when slot is booked' do
      let(:time_slot) { create(:time_slot, :booked) }

      before { sign_in_as(admin) }

      it 'returns conflict' do
        authenticated_delete "/api/admin/time_slots/#{time_slot.id}"
        expect(response).to have_http_status(:conflict)
      end
    end

    context 'when manager' do
      let(:time_slot) { create(:time_slot, :available) }

      before { sign_in_as(manager) }

      it 'returns forbidden' do
        authenticated_delete "/api/admin/time_slots/#{time_slot.id}"
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'POST /api/admin/time_slots/bulk_create' do
    let(:slot1_starts) { 2.days.from_now.change(hour: 19, min: 0) }
    let(:slot2_starts) { 3.days.from_now.change(hour: 19, min: 0) }
    let(:valid_params) do
      {
        time_slots: [
          { starts_at: slot1_starts.iso8601, ends_at: (slot1_starts + 90.minutes).iso8601 },
          { starts_at: slot2_starts.iso8601, ends_at: (slot2_starts + 90.minutes).iso8601 },
        ],
      }
    end

    context 'when admin' do
      before { sign_in_as(admin) }

      it 'creates multiple time slots' do
        expect do
          authenticated_post '/api/admin/time_slots/bulk_create', params: valid_params
        end.to change(TimeSlot, :count).by(2)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body['data'].length).to eq(2)
        expect(body['meta']['total_created']).to eq(2)
      end
    end

    context 'when one slot is invalid (atomicity)' do
      let(:invalid_params) do
        {
          time_slots: [
            { starts_at: slot1_starts.iso8601, ends_at: (slot1_starts + 90.minutes).iso8601 },
            { starts_at: slot2_starts.iso8601, ends_at: (slot2_starts - 1.hour).iso8601 },
          ],
        }
      end

      before { sign_in_as(admin) }

      it 'does not create any slots' do
        expect do
          authenticated_post '/api/admin/time_slots/bulk_create', params: invalid_params
        end.not_to change(TimeSlot, :count)

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'when manager' do
      before { sign_in_as(manager) }

      it 'returns forbidden' do
        authenticated_post '/api/admin/time_slots/bulk_create', params: valid_params
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
