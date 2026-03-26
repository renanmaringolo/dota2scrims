require 'rails_helper'

RSpec.describe ScrimReminderJob do
  let(:admin) { create(:user, :admin, email: 'admin@avalanche.gg') }
  let(:manager) { create(:user, :manager) }
  let(:team) { create(:team, manager: manager, manager_email: 'manager@test.gg') }
  let(:time_slot) { create(:time_slot, :available) }
  let(:scrim) { create(:scrim, :with_lobby_info, challenger_team: team, time_slot: time_slot) }

  before { admin }

  describe '#perform' do
    it 'sends reminder for a scheduled scrim' do
      mail = instance_double(ActionMailer::MessageDelivery)
      allow(ScrimMailer).to receive(:scrim_reminder).with(scrim).and_return(mail)
      allow(mail).to receive(:deliver_later)

      described_class.perform_now(scrim.id)

      expect(ScrimMailer).to have_received(:scrim_reminder).with(scrim)
      expect(mail).to have_received(:deliver_later)
    end

    it 'does not send if scrim does not exist' do
      allow(ScrimMailer).to receive(:scrim_reminder)

      described_class.perform_now(0)

      expect(ScrimMailer).not_to have_received(:scrim_reminder)
    end

    it 'does not send if scrim is cancelled' do
      cancelled_scrim = create(:scrim, :cancelled,
                               challenger_team: team,
                               time_slot: create(:time_slot, :booked,
                                                 starts_at: 3.days.from_now.change(hour: 19, min: 0)))
      allow(ScrimMailer).to receive(:scrim_reminder)

      described_class.perform_now(cancelled_scrim.id)

      expect(ScrimMailer).not_to have_received(:scrim_reminder)
    end
  end

  describe 'queue configuration' do
    it 'is enqueued in the mailers queue' do
      expect(described_class.new.queue_name).to eq('mailers')
    end
  end
end
