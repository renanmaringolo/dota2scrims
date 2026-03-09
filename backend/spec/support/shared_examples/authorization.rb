RSpec.shared_examples 'an admin-only endpoint' do
  context 'when user is not admin' do
    it 'returns 403 forbidden' do
      make_request(headers: auth_headers_for(non_admin_user))
      expect(response).to have_http_status(:forbidden)
    end
  end
end
