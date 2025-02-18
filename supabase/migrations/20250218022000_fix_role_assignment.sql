-- First, drop the existing policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Recreate policies with proper permissions
CREATE POLICY "System can assign default roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (check_user_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Verify the assign_default_role function is properly set
ALTER FUNCTION assign_default_role() SET search_path = public; 