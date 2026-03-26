require 'rails_helper'

RSpec.describe ScrimNotificationService do
  let(:scrim) { instance_double(Scrim, id: 1) }
  let(:scheduled_mail) { instance_double(ActionMailer::MessageDelivery) }
  let(:admin_mail) { instance_double(ActionMailer::MessageDelivery) }
  let(:cancellation_mail) { instance_double(ActionMailer::MessageDelivery) }
  let(:admin_cancellation_mail) { instance_double(ActionMailer::MessageDelivery) }

  describe '.scrim_scheduled' do
    before do
      allow(ScrimMailer).to receive(:scheduled_confirmation).with(scrim).and_return(scheduled_mail)
      allow(ScrimMailer).to receive(:admin_notification).with(scrim).and_return(admin_mail)
      allow(scheduled_mail).to receive(:deliver_later)
      allow(admin_mail).to receive(:deliver_later)
    end

    it 'sends scheduled confirmation to the manager' do
      described_class.scrim_scheduled(scrim)

      expect(ScrimMailer).to have_received(:scheduled_confirmation).with(scrim)
      expect(scheduled_mail).to have_received(:deliver_later)
    end

    it 'sends admin notification' do
      described_class.scrim_scheduled(scrim)

      expect(ScrimMailer).to have_received(:admin_notification).with(scrim)
      expect(admin_mail).to have_received(:deliver_later)
    end
  end

  describe '.scrim_cancelled' do
    before do
      allow(ScrimMailer).to receive(:cancellation_notice).with(scrim).and_return(cancellation_mail)
      allow(ScrimMailer).to receive(:admin_cancellation_notice).with(scrim).and_return(admin_cancellation_mail)
      allow(cancellation_mail).to receive(:deliver_later)
      allow(admin_cancellation_mail).to receive(:deliver_later)
    end

    it 'sends cancellation notice to the manager' do
      described_class.scrim_cancelled(scrim)

      expect(ScrimMailer).to have_received(:cancellation_notice).with(scrim)
      expect(cancellation_mail).to have_received(:deliver_later)
    end

    it 'sends admin cancellation notice' do
      described_class.scrim_cancelled(scrim)

      expect(ScrimMailer).to have_received(:admin_cancellation_notice).with(scrim)
      expect(admin_cancellation_mail).to have_received(:deliver_later)
    end
  end
end
